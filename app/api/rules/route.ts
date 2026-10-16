import { NextResponse } from "next/server";

// Simpanan konfigurasi dalam memori (sedia diintegrasikan dengan Cloudflare D1 / KV)
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
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mod 1: Kemas kini selector secara manual / kelulusan Subagent dari Dashboard
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

    // Mod 2: Simulasi laporan kerosakan DOM daripada aplikasi pelanggan
    if (body.action === "REPORT_BROKEN") {
      currentRules.status = "DEGRADED";
      currentRules.updatedAt = new Date().toISOString();
      return NextResponse.json({
        ok: true,
        message: "Telemetry logged. Subagent queued for DOM analysis.",
        data: currentRules,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 500 });
  }
}
