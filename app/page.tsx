"use client";

import React, { useEffect, useState } from "react";

interface RuleConfig {
  providerId: string;
  baseUrl: string;
  status: "HEALTHY" | "DEGRADED";
  version: number;
  updatedAt: string;
  selectors: {
    homeSection: string;
    titleAttr: string;
    posterAttr: string;
    streamTarget: string;
  };
}

export default function ControlPlanePage() {
  const [config, setConfig] = useState<RuleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [customHomeSelector, setCustomHomeSelector] = useState("");

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rules", { cache: "no-store" });
      const data = await res.json();
      setConfig(data);
      setCustomHomeSelector(data.selectors.homeSection);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const triggerPatch = async () => {
    await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "APPLY_PATCH",
        newSelectors: { homeSection: customHomeSelector },
      }),
    });
    await fetchRules();
  };

  const simulateBreak = async () => {
    await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REPORT_BROKEN" }),
    });
    await fetchRules();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#09090b",
        color: "#f4f4f5",
        fontFamily: "system-ui, sans-serif",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div
          style={{
            borderBottom: "1px solid #27272a",
            paddingBottom: "16px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: "#064e3b",
              color: "#34d399",
              fontWeight: 600,
            }}
          >
            LIVE CONTROL PLANE
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "12px" }}>
            Dynamic Selector & MCP Engine
          </h1>
          <p style={{ fontSize: "14px", color: "#a1a1aa" }}>
            Urus aturan ekstraksi secara masa nyata terus dari pelayar Android.
          </p>
        </div>

        {loading || !config ? (
          <p style={{ color: "#a1a1aa" }}>Memuatkan telemetri sistem...</p>
        ) : (
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
                  {config.providerId} (v{config.version})
                </h2>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#71717a",
                    fontFamily: "monospace",
                    margin: "4px 0 0 0",
                  }}
                >
                  Endpoint: /api/rules
                </p>
              </div>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor:
                    config.status === "HEALTHY" ? "#064e3b" : "#78350f",
                  color: config.status === "HEALTHY" ? "#34d399" : "#fbbf24",
                }}
              >
                {config.status}
              </span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#a1a1aa",
                  marginBottom: "6px",
                }}
              >
                CSS Selector (homeSection):
              </label>
              <input
                type="text"
                value={customHomeSelector}
                onChange={(e) => setCustomHomeSelector(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #3f3f46",
                  backgroundColor: "#09090b",
                  color: "#e4e4e7",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={triggerPatch}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Update & Push Live Patch
              </button>
              <button
                onClick={simulateBreak}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #3f3f46",
                  backgroundColor: "transparent",
                  color: "#fca5a5",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Simulasi Ralat DOM
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
