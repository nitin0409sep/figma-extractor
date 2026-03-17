"use client";

import { useMemo, useState } from "react";
import { DesignNode, ExtractedDesign } from "@/types/figma";

type Tab = "json" | "css" | "tailwind" | "components";

interface Props {
  data: ExtractedDesign;
}

function collectCSS(
  nodes: DesignNode[],
  result: Record<string, Record<string, string>> = {},
): Record<string, Record<string, string>> {
  for (const node of nodes) {
    if (Object.keys(node.css).length > 0) {
      result[`${node.name} (${node.id})`] = node.css;
    }
    collectCSS(node.children, result);
  }
  return result;
}

function collectTailwind(
  nodes: DesignNode[],
  result: Record<string, string> = {},
): Record<string, string> {
  for (const node of nodes) {
    if (node.tailwind) {
      result[`${node.name} (${node.id})`] = node.tailwind;
    }
    collectTailwind(node.children, result);
  }
  return result;
}

function collectComponents(
  nodes: DesignNode[],
  result: Record<string, unknown> = {},
): Record<string, unknown> {
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
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "var(--syntax-number)";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "var(--syntax-key)" : "var(--syntax-string)";
      } else if (/true|false/.test(match)) {
        cls = "var(--syntax-boolean)";
      } else if (/null/.test(match)) {
        cls = "var(--syntax-null)";
      }
      return `<span style="color:${cls}">${match}</span>`;
    },
  );
}

const tabConfig: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "json",
    label: "Full JSON",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    key: "css",
    label: "CSS",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    key: "tailwind",
    label: "Tailwind",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: "components",
    label: "Components",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

export default function JsonPreview({ data }: Props) {
  const [tab, setTab] = useState<Tab>("json");
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
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
          2,
        );
    }
  }, [tab, data]);

  const highlighted = useMemo(() => syntaxHighlight(content), [content]);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card overflow-hidden">
      {/* Tab bar */}
      <div
        className="flex items-center justify-between border-b px-1"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="flex gap-0.5">
          {tabConfig.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-all duration-200"
              style={{
                color: tab === t.key ? "var(--accent-primary)" : "var(--text-tertiary)",
              }}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {tab === t.key && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="mr-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200"
          style={{
            backgroundColor: copied ? "var(--accent-success)" : "var(--bg-tertiary)",
            color: copied ? "var(--text-inverse)" : "var(--text-secondary)",
          }}
        >
          {copied ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* Code */}
      <pre
        className="p-4 text-[13px] leading-relaxed overflow-auto max-h-[600px]"
        style={{ backgroundColor: "var(--bg-code)" }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
