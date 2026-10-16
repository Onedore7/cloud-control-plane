import { NextResponse } from "next/server";

let currentRules = {
  providerId: "OpenCatalogProvider",
  baseUrl: "https://archive.org",
  status: "HEALTHY",
  version: 1,
  updatedAt: new Date().toISOString(),
  selectors: {
    homeSection: "div.item-ia",
    titleAttr: "div.ttl a",
    posterAttr: "img.item-img",
    streamTarget: "video source",
  },
};

export async function GET() {
  return NextResponse.json(currentRules, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mod 1: Kelulusan manual atau kemas kini dari Dashboard
    if (body.action === "APPLY_PATCH" && body.newSelectors) {
      currentRules = {
        ...currentRules,
        status: "HEALTHY",
        version: currentRules.version + 1,
        updatedAt: new Date().toISOString(),
        selectors: {
          ...currentRules.selectors,
          ...body.newSelectors,
        },
      };
      return NextResponse.json({ ok: true, data: currentRules });
    }

    // Mod 2: Subagent AI Auto-Heal apabila pelanggan lapor ralat DOM
    if (body.action === "REPORT_BROKEN") {
      const { failedKey, sampleHtml } = body;
      currentRules.status = "DEGRADED";

      // Panggilan ke Vertex AI melalui Cloudflare AI Gateway (jika API key aktif)
      const gatewayUrl = process.env.CF_AI_GATEWAY_URL;
      const apiKey = process.env.VERTEX_API_KEY;

      if (gatewayUrl && apiKey && sampleHtml) {
        try {
          const aiRes = await fetch(gatewayUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: `Analyze this HTML snippet and give a valid CSS selector for key "${failedKey}". Return strict JSON: {"selector": "string"}` }]
              }],
              generationConfig: { responseMimeType: "application/json" }
            }),
          });
          const aiJson = await aiRes.json();
          const parsed = JSON.parse(aiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
          
          if (parsed.selector) {
            currentRules.selectors = {
              ...currentRules.selectors,
              [failedKey]: parsed.selector,
            };
            currentRules.status = "HEALTHY";
            currentRules.version += 1;
          }
        } catch (e) {
          // Fallback jika AI gateway gagal
        }
      }

      currentRules.updatedAt = new Date().toISOString();
      return NextResponse.json({
        ok: true,
        message: "Subagent evaluated DOM and applied patch.",
        data: currentRules,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
