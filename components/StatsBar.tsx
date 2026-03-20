"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ExtractedDesign } from "@/types/figma";

interface Props {
  data: ExtractedDesign;
}

export default function StatsBar({ data }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<number[]>([0, 0, 0, 0, 0]);

  const measureHeight = useCallback((index: number) => {
    const el = contentRefs.current[index];
    if (el) {
      setHeights((prev) => {
        const next = [...prev];
        next[index] = el.scrollHeight;
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (expandedIndex !== null) {
      measureHeight(expandedIndex);
    }
  }, [expandedIndex, measureHeight]);

  const toggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const colors = data.designTokens.colors;
  const typography = data.designTokens.typography;
  const spacing = data.designTokens.spacing;
  const components = data.componentTree;
  const nodes = data.nodes;

  const stats = [
    {
      label: "Nodes",
      value: nodes.length,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      detail: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {nodes.map((node) => {
            const bgColor = node.styles.fills?.[0]?.color
              ? `rgba(${Math.round(node.styles.fills[0].color.r * 255)}, ${Math.round(node.styles.fills[0].color.g * 255)}, ${Math.round(node.styles.fills[0].color.b * 255)}, ${node.styles.fills[0].color.a ?? 1})`
              : null;
            return (
              <div
                key={node.id}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                {bgColor && (
                  <span
                    className="w-3.5 h-3.5 rounded shrink-0 border"
                    style={{ backgroundColor: bgColor, borderColor: "var(--border-primary)" }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium block truncate" style={{ color: "var(--text-primary)" }}>
                    {node.name}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {node.type} &middot; {node.dimensions.width}x{node.dimensions.height}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      label: "Colors",
      value: Object.keys(colors).length,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="10.5" r="2.5" />
          <circle cx="8.5" cy="7.5" r="2.5" />
          <circle cx="6.5" cy="12.5" r="2.5" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      ),
      detail: () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(colors).map(([hex, name]) => (
            <div
              key={hex}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <span
                className="w-8 h-8 rounded-md shrink-0 border"
                style={{ backgroundColor: hex, borderColor: "var(--border-primary)" }}
              />
              <div className="min-w-0">
                <span className="text-[10px] font-mono block truncate" style={{ color: "var(--text-primary)" }}>
                  {hex}
                </span>
                <span className="text-[10px] block truncate" style={{ color: "var(--text-tertiary)" }}>
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Typography",
      value: Object.keys(typography).length,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
      detail: () => (
        <div className="space-y-2">
          {Object.entries(typography).map(([name, style]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <div className="min-w-0 flex-1">
                <span
                  className="block truncate leading-tight"
                  style={{
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    lineHeight: style.lineHeight,
                    color: "var(--text-primary)",
                  }}
                >
                  {name}
                </span>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <span className="text-[10px] font-mono block" style={{ color: "var(--text-secondary)" }}>
                  {style.fontFamily} &middot; {style.fontWeight}
                </span>
                <span className="text-[10px] font-mono block" style={{ color: "var(--text-tertiary)" }}>
                  {style.fontSize} / {style.lineHeight} &middot; ls: {style.letterSpacing}
                </span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Spacing",
      value: spacing.length,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 3H3v7h18V3z" />
          <path d="M21 14H3v7h18v-7z" />
        </svg>
      ),
      detail: () => (
        <div className="flex flex-wrap gap-2">
          {spacing.map((val) => {
            const px = parseInt(val, 10) || 0;
            return (
              <div
                key={val}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <div
                  className="rounded-sm shrink-0"
                  style={{
                    width: `${Math.min(Math.max(px, 4), 48)}px`,
                    height: "12px",
                    backgroundColor: "var(--accent-primary)",
                    opacity: 0.6,
                  }}
                />
                <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      label: "Components",
      value: Object.keys(components).length,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
      detail: () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(components).map(([id, name]) => (
            <div
              key={id}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0"
                style={{ color: "var(--accent-primary)" }}
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-0">
      {/* Cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat, i) => {
          const isExpanded = expandedIndex === i;
          const hasItems = stat.value > 0;
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => hasItems && toggle(i)}
              className={`card flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                hasItems ? "cursor-pointer hover:shadow-md" : "cursor-default opacity-60"
              } ${isExpanded ? "ring-2" : ""}`}
              style={{
                ["--tw-ring-color" as string]: isExpanded ? "var(--accent-primary)" : undefined,
              }}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              >
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {stat.label}
                </div>
              </div>
              {hasItems && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 transition-transform duration-300"
                  style={{
                    color: "var(--text-tertiary)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Expandable detail panel */}
      {stats.map((stat, i) => {
        const isExpanded = expandedIndex === i;
        return (
          <div
            key={`detail-${stat.label}`}
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isExpanded ? `${heights[i]}px` : "0px",
              opacity: isExpanded ? 1 : 0,
            }}
          >
            <div
              ref={(el) => {
                contentRefs.current[i] = el;
              }}
              className="card mt-3 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {stat.label}
                  <span className="font-normal ml-1.5" style={{ color: "var(--text-tertiary)" }}>
                    ({stat.value})
                  </span>
                </h3>
              </div>
              {isExpanded && stat.detail()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
