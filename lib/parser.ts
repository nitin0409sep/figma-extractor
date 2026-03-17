import {
  DesignNode,
  DesignTokens,
  ExtractedDesign,
  FigmaFileResponse,
  FigmaNode,
  FigmaNodesResponse,
} from "@/types/figma";
import { buildComponentTree, generateComponentSuggestion } from "./component-mapper";
import { colorToHex, generateCSS } from "./css-mapper";
import { generateTailwind } from "./tailwind-mapper";

function parseNode(node: FigmaNode): DesignNode {
  const css = generateCSS(node);

  // For text nodes, add color from fills
  if (node.type === "TEXT" && node.fills && node.fills.length > 0) {
    const visibleFill = node.fills.find((f) => f.visible !== false && f.type === "SOLID");
    if (visibleFill?.color) {
      const r = Math.round(visibleFill.color.r * 255);
      const g = Math.round(visibleFill.color.g * 255);
      const b = Math.round(visibleFill.color.b * 255);
      css.color = `rgb(${r}, ${g}, ${b})`;
      // Remove background-color for text nodes — fills become text color
      delete css["background-color"];
    }
  }

  const tailwind = generateTailwind(css);
  const componentSuggestion = generateComponentSuggestion(node, tailwind);

  const box = node.absoluteBoundingBox;

  const designNode: DesignNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible !== false,
    dimensions: {
      width: box?.width ?? 0,
      height: box?.height ?? 0,
    },
    position: {
      x: box?.x ?? 0,
      y: box?.y ?? 0,
    },
    styles: {
      fills: node.fills ?? [],
      strokes: node.strokes ?? [],
      strokeWeight: node.strokeWeight,
      cornerRadius: node.cornerRadius,
      rectangleCornerRadii: node.rectangleCornerRadii,
      opacity: node.opacity,
      effects: node.effects ?? [],
      typography: node.style,
    },
    css,
    tailwind,
    componentSuggestion,
    children: [],
  };

  if (node.characters) {
    designNode.text = node.characters;
  }

  if (node.layoutMode && node.layoutMode !== "NONE") {
    designNode.autoLayout = {
      direction: node.layoutMode,
      gap: node.itemSpacing ?? 0,
      padding: {
        top: node.paddingTop ?? 0,
        right: node.paddingRight ?? 0,
        bottom: node.paddingBottom ?? 0,
        left: node.paddingLeft ?? 0,
      },
      primaryAxisAlign: node.primaryAxisAlignItems ?? "MIN",
      counterAxisAlign: node.counterAxisAlignItems ?? "MIN",
    };
  }

  if (node.children) {
    designNode.children = node.children.filter((child) => child.visible !== false).map(parseNode);
  }

  return designNode;
}

function collectTokens(nodes: DesignNode[]): DesignTokens {
  const colors = new Map<string, string>();
  const typography = new Map<string, DesignTokens["typography"][string]>();
  const spacingSet = new Set<string>();

  function walk(node: DesignNode) {
    // Collect colors from fills
    for (const fill of node.styles.fills) {
      if (fill.type === "SOLID" && fill.color) {
        const hex = colorToHex(fill.color);
        colors.set(hex, node.name);
      }
    }

    // Collect typography
    if (node.styles.typography) {
      const t = node.styles.typography;
      const key = `${t.fontFamily}-${t.fontSize}-${t.fontWeight}`;
      if (!typography.has(key)) {
        typography.set(key, {
          fontFamily: t.fontFamily,
          fontSize: `${t.fontSize}px`,
          fontWeight: t.fontWeight,
          lineHeight: t.lineHeightPx ? `${t.lineHeightPx}px` : "normal",
          letterSpacing: t.letterSpacing ? `${t.letterSpacing}px` : "0px",
        });
      }
    }

    // Collect spacing
    if (node.autoLayout) {
      if (node.autoLayout.gap > 0) spacingSet.add(`${node.autoLayout.gap}px`);
      const p = node.autoLayout.padding;
      if (p.top > 0) spacingSet.add(`${p.top}px`);
      if (p.right > 0) spacingSet.add(`${p.right}px`);
      if (p.bottom > 0) spacingSet.add(`${p.bottom}px`);
      if (p.left > 0) spacingSet.add(`${p.left}px`);
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  for (const node of nodes) {
    walk(node);
  }

  const colorRecord: Record<string, string> = {};
  colors.forEach((name, hex) => {
    colorRecord[hex] = name;
  });

  const typoRecord: Record<string, DesignTokens["typography"][string]> = {};
  typography.forEach((val, key) => {
    typoRecord[key] = val;
  });

  return {
    colors: colorRecord,
    typography: typoRecord,
    spacing: Array.from(spacingSet).sort((a, b) => parseFloat(a) - parseFloat(b)),
  };
}

function collectAllNodes(nodes: DesignNode[]): DesignNode[] {
  const all: DesignNode[] = [];
  function walk(node: DesignNode) {
    all.push(node);
    for (const child of node.children) walk(child);
  }
  for (const n of nodes) walk(n);
  return all;
}

export function parseDesignFromNodes(
  fileKey: string,
  data: FigmaNodesResponse,
  _nodeId: string,
): ExtractedDesign {
  const nodeEntries = Object.values(data.nodes);
  const nodes = nodeEntries
    .filter((entry) => entry.document)
    .flatMap((entry) => {
      const doc = entry.document;
      // If the node has children, parse those; otherwise parse the node itself
      if (doc.children && doc.children.length > 0) {
        return doc.children.filter((child) => child.visible !== false).map(parseNode);
      }
      return [parseNode(doc)];
    });

  const designTokens = collectTokens(nodes);
  const allNodes = collectAllNodes(nodes);
  const componentTree = buildComponentTree(allNodes);

  return {
    fileKey,
    fileName: data.name,
    lastModified: data.lastModified,
    nodes,
    designTokens,
    componentTree,
  };
}

export function parseDesign(fileKey: string, data: FigmaFileResponse): ExtractedDesign {
  const doc = data.document;

  // Figma files have a DOCUMENT root with PAGE children; parse children of each page
  const pages = doc.children ?? [];
  const nodes = pages.flatMap((page) =>
    (page.children ?? []).filter((child) => child.visible !== false).map(parseNode),
  );

  const designTokens = collectTokens(nodes);
  const allNodes = collectAllNodes(nodes);
  const componentTree = buildComponentTree(allNodes);

  return {
    fileKey,
    fileName: data.name,
    lastModified: data.lastModified,
    nodes,
    designTokens,
    componentTree,
  };
}
