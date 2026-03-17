"use client";

import { useState } from "react";
import TokenInput from "@/components/TokenInput";
import LinkInput from "@/components/LinkInput";
import JsonPreview from "@/components/JsonPreview";
import DownloadButton from "@/components/DownloadButton";
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
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Figma Design Extractor
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Paste a Figma design URL to extract structured JSON with CSS, Tailwind classes, and component mappings.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <TokenInput value={token} onChange={setToken} />
        <LinkInput
          value={url}
          onChange={setUrl}
          onSubmit={handleExtract}
          loading={loading}
        />
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-6 space-y-3">
          <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-800 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3" />
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                {data.fileName}
              </h2>
              <p className="text-xs text-gray-500">
                {data.nodes.length} top-level nodes &middot; Last modified{" "}
                {new Date(data.lastModified).toLocaleDateString()}
              </p>
            </div>
            <DownloadButton data={data} />
          </div>
          <JsonPreview data={data} />
        </div>
      )}
    </main>
  );
}
