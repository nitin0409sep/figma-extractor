"use client";

import { useState } from "react";
import { ExtractedDesign, DesignNode } from "@/types/figma";

type Tab = "json" | "css" | "tailwind" | "components";

interface Props {
  data: ExtractedDesign;
}

function collectCSS(nodes: DesignNode[], result: Record<string, Record<string, string>> = {}): Record<string, Record<string, string>> {
  for (const node of nodes) {
    if (Object.keys(node.css).length > 0) {
      result[`${node.name} (${node.id})`] = node.css;
    }
    collectCSS(node.children, result);
  }
  return result;
}

function collectTailwind(nodes: DesignNode[], result: Record<string, string> = {}): Record<string, string> {
  for (const node of nodes) {
    if (node.tailwind) {
      result[`${node.name} (${node.id})`] = node.tailwind;
    }
    collectTailwind(node.children, result);
  }
  return result;
}

function collectComponents(nodes: DesignNode[], result: Record<string, unknown> = {}): Record<string, unknown> {
  for (const node of nodes) {
    if (node.componentSuggestion.isComponent || node.componentSuggestion.tag !== "div") {
      result[`${node.name} (${node.id})`] = node.componentSuggestion;
    }
    collectComponents(node.children, result);
  }
  return result;
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-300"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-blue-400"; // key
        } else {
          cls = "text-green-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-purple-400"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-gray-500"; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function JsonPreview({ data }: Props) {
  const [tab, setTab] = useState<Tab>("json");
  const [copied, setCopied] = useState(false);

  function getContent(): string {
    switch (tab) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "css":
        return JSON.stringify(collectCSS(data.nodes), null, 2);
      case "tailwind":
        return JSON.stringify(collectTailwind(data.nodes), null, 2);
      case "components":
        return JSON.stringify(
          { componentTree: data.componentTree, nodes: collectComponents(data.nodes) },
          null,
          2
        );
    }
  }

  const content = getContent();

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "json", label: "Full JSON" },
    { key: "css", label: "CSS" },
    { key: "tailwind", label: "Tailwind" },
    { key: "components", label: "Components" },
  ];

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50">
        <div className="flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-900"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={copyToClipboard}
          className="mr-2 px-3 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-auto max-h-[600px] bg-gray-950">
        <code
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(content) }}
        />
      </pre>
    </div>
  );
}
