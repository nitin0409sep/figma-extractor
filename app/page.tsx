"use client";

import { useState } from "react";
import DownloadButton from "@/components/DownloadButton";
import ErrorBoundary from "@/components/ErrorBoundary";
import JsonPreview from "@/components/JsonPreview";
import LinkInput from "@/components/LinkInput";
import StatsBar from "@/components/StatsBar";
import ThemeToggle from "@/components/ThemeToggle";
import TokenInput from "@/components/TokenInput";
import { ExtractedDesign } from "@/types/figma";

export default function Home() {
  const [token, setToken] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractedDesign | null>(null);

  async function handleExtract() {
    if (!token.trim()) {
      setError("Please enter your Figma Personal Access Token.");
      return;
    }
    if (!url.trim()) {
      setError("Please enter a Figma design URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), token: token.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || `Request failed with status ${res.status}`);
        return;
      }

      setData(json);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-inverse)" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Figma Extractor
            </h1>
          </div>
          <p className="text-sm max-w-lg" style={{ color: "var(--text-secondary)" }}>
            Extract structured design data from Figma files — CSS properties, Tailwind classes,
            component mappings, and design tokens.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Input Section */}
      <div className="card p-6 mb-6 space-y-5">
        <TokenInput value={token} onChange={setToken} />
        <LinkInput value={url} onChange={setUrl} onSubmit={handleExtract} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm"
          style={{
            backgroundColor: "var(--accent-danger-bg)",
            borderColor: "var(--accent-danger-border)",
            color: "var(--accent-danger)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
            />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Extracting design data...
            </span>
          </div>
          <div className="space-y-3">
            <div
              className="h-3 rounded-full animate-pulse w-3/4"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
            <div
              className="h-3 rounded-full animate-pulse w-1/2"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
            <div
              className="h-3 rounded-full animate-pulse w-5/6"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
            <div
              className="h-3 rounded-full animate-pulse w-2/3"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <ErrorBoundary>
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {data.fileName}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Last modified {new Date(data.lastModified).toLocaleDateString()}
                </p>
              </div>
              <DownloadButton data={data} />
            </div>
            <StatsBar data={data} />
            <JsonPreview data={data} />
          </div>
        </ErrorBoundary>
      )}

      {/* Footer */}
      <footer
        className="mt-12 pt-6 border-t text-center text-xs"
        style={{ borderColor: "var(--border-primary)", color: "var(--text-tertiary)" }}
      >
        Figma Extractor — Design to code, simplified.
      </footer>
    </main>
  );
}
