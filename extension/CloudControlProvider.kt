package com.lagradost.cloudstream3.plugin

import com.lagradost.cloudstream3.*
import com.lagradost.cloudstream3.utils.*
import com.lagradost.cloudstream3.utils.AppUtils.parseJson
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element

data class DynamicSelectors(
    val baseUrl: String = "https://archive.org",
    val homeSection: String = "div.item-ia",
    val titleAttr: String = "div.ttl a",
    val posterAttr: String = "img.item-img",
    val streamTarget: String = "video source"
)

class CloudControlProvider : MainAPI() {
    override var mainUrl = "https://archive.org"
    override var name = "Cloud Control Provider"
    override val hasMainPage = true
    override var lang = "en"
    override val supportedTypes = setOf(TvType.Movie, TvType.TvSeries)

    // Gantikan URL di bawah dengan URL Vercel live kau (contoh: https://cloud-control-plane-xxx.vercel.app/api/rules)
    private val remoteConfigUrl = "https://cloud-control-plane.vercel.app/api/rules"
    
    @Volatile
    private var cachedSelectors: DynamicSelectors? = null

    private suspend fun getSelectors(): DynamicSelectors {
        cachedSelectors?.let { return it }
        return try {
            val response = app.get(remoteConfigUrl, timeout = 5L).text
            val root = parseJson<Map<String, Any>>(response)
            val selectorsMap = root["selectors"] as? Map<String, String>
            
            DynamicSelectors(
                baseUrl = root["baseUrl"] as? String ?: "https://archive.org",
                homeSection = selectorsMap?.get("homeSection") ?: "div.item-ia",
                titleAttr = selectorsMap?.get("titleAttr") ?: "div.ttl a",
                posterAttr = selectorsMap?.get("posterAttr") ?: "img.item-img",
                streamTarget = selectorsMap?.get("streamTarget") ?: "video source"
            ).also {
                cachedSelectors = it
                mainUrl = it.baseUrl
            }
        } catch (e: Exception) {
            DynamicSelectors()
        }
    }

    private suspend fun reportBrokenDom(key: String, html: String) {
        runCatching {
            app.post(
                url = remoteConfigUrl,
                json = mapOf(
                    "action" to "REPORT_BROKEN",
                    "failedKey" to key,
                    "sampleHtml" to html.take(3000)
                )
            )
        }
    }

    override val mainPage = mainPageOf(
        "details" to "Popular Collections"
    )

    override suspend fun getMainPage(page: Int, request: MainPageRequest): HomePageResponse {
        val rules = getSelectors()
        val doc = app.get("$mainUrl/details?page=$page").document
        val elements = doc.select(rules.homeSection)

        if (elements.isEmpty()) {
            reportBrokenDom("homeSection", doc.body().html())
        }

        val items = elements.mapNotNull { it.toSearchResult(rules) }
        return newHomePageResponse(request.name, items)
    }

    private fun Element.toSearchResult(rules: DynamicSelectors): SearchResponse? {
        val anchor = this.selectFirst(rules.titleAttr) ?: return null
        val title = anchor.text().trim().ifEmpty { anchor.attr("title") }
        val href = fixUrlNull(anchor.attr("href")) ?: return null
        val poster = fixUrlNull(this.selectFirst(rules.posterAttr)?.attr("src"))

        return newMovieSearchResponse(title, href,TvType.Movie) {
            this.posterUrl = poster
        }
    }
}
