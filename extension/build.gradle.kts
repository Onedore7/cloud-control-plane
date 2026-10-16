// Use an integer for version numbers
version = 1

cloudstream {
    description = "Public-domain movies, series & audio from archive.org, with remote control-plane config."
    authors = listOf("Onedore7")

    /**
     * Status int as one of the following:
     * 0: Down
     * 1: Ok
     * 2: Slow
     * 3: Beta-only
     */
    status = 1 // Will be 3 if unspecified

    tvTypes = listOf("Movie", "TvSeries", "Audio")
    iconUrl = "https://www.google.com/s2/favicons?domain=archive.org&sz=128"

    isCrossPlatform = true
}
