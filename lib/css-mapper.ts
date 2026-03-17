import { FigmaNode, FigmaColor, FigmaPaint, CSSMapping } from "@/types/figma";

function colorToRgba(color: FigmaColor, opacity?: number): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity !== undefined ? opacity : color.a;
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

export function colorToHex(color: FigmaColor): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, "0");
  const g = Math.round(color.g * 255).toString(16).padStart(2, "0");
  const b = Math.round(color.b * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function mapFills(fills: FigmaPaint[]): CSSMapping {
  const css: CSSMapping = {};
  const visibleFills = fills.filter((f) => f.visible !== false);
  if (visibleFills.length === 0) return css;

  const fill = visibleFills[0];
  if (fill.type === "SOLID" && fill.color) {
    css["background-color"] = colorToRgba(fill.color, fill.opacity);
  } else if (fill.type === "GRADIENT_LINEAR" && fill.gradientStops) {
    const stops = fill.gradientStops
      .map((s) => `${colorToRgba(s.color)} ${Math.round(s.position * 100)}%`)
      .join(", ");
    css["background-image"] = `linear-gradient(${stops})`;
  } else if (fill.type === "IMAGE") {
    css["background-image"] = "url(/* image ref */)";
    css["background-size"] = fill.scaleMode === "FILL" ? "cover" : "contain";
  }
  return css;
}

function mapTypography(style: {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  letterSpacing: number;
  lineHeightPx?: number;
  textAlignHorizontal?: string;
  textDecoration?: string;
  textCase?: string;
}): CSSMapping {
  const css: CSSMapping = {};
  css["font-family"] = `"${style.fontFamily}", sans-serif`;
  css["font-size"] = `${style.fontSize}px`;
  css["font-weight"] = String(style.fontWeight);
  if (style.letterSpacing) {
    css["letter-spacing"] = `${style.letterSpacing}px`;
  }
  if (style.lineHeightPx) {
    css["line-height"] = `${style.lineHeightPx}px`;
  }
  if (style.textAlignHorizontal) {
    const alignMap: Record<string, string> = {
      LEFT: "left",
      CENTER: "center",
      RIGHT: "right",
      JUSTIFIED: "justify",
    };
    css["text-align"] = alignMap[style.textAlignHorizontal] || "left";
  }
  if (style.textDecoration === "UNDERLINE") {
    css["text-decoration"] = "underline";
  } else if (style.textDecoration === "STRIKETHROUGH") {
    css["text-decoration"] = "line-through";
  }
  if (style.textCase === "UPPER") {
    css["text-transform"] = "uppercase";
  } else if (style.textCase === "LOWER") {
    css["text-transform"] = "lowercase";
  }
  return css;
}

function mapEffects(effects: { type: string; visible?: boolean; color?: FigmaColor; offset?: { x: number; y: number }; radius: number; spread?: number }[]): CSSMapping {
  const css: CSSMapping = {};
  const visible = effects.filter((e) => e.visible !== false);

  const shadows = visible.filter(
    (e) => e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW"
  );
  if (shadows.length > 0) {
    css["box-shadow"] = shadows
      .map((s) => {
        const inset = s.type === "INNER_SHADOW" ? "inset " : "";
        const x = s.offset?.x ?? 0;
        const y = s.offset?.y ?? 0;
        const color = s.color ? colorToRgba(s.color) : "rgba(0,0,0,0.25)";
        const spread = s.spread ? ` ${s.spread}px` : "";
        return `${inset}${x}px ${y}px ${s.radius}px${spread} ${color}`;
      })
      .join(", ");
  }

  const blurs = visible.filter((e) => e.type === "LAYER_BLUR");
  if (blurs.length > 0) {
    css["filter"] = `blur(${blurs[0].radius}px)`;
  }

  const bgBlurs = visible.filter((e) => e.type === "BACKGROUND_BLUR");
  if (bgBlurs.length > 0) {
    css["backdrop-filter"] = `blur(${bgBlurs[0].radius}px)`;
  }

  return css;
}

function mapLayout(node: FigmaNode): CSSMapping {
  const css: CSSMapping = {};
  const box = node.absoluteBoundingBox;

  if (box) {
    css["width"] = `${box.width}px`;
    css["height"] = `${box.height}px`;
  }

  if (node.layoutMode && node.layoutMode !== "NONE") {
    css["display"] = "flex";
    css["flex-direction"] = node.layoutMode === "HORIZONTAL" ? "row" : "column";

    if (node.itemSpacing) {
      css["gap"] = `${node.itemSpacing}px`;
    }

    const justifyMap: Record<string, string> = {
      MIN: "flex-start",
      CENTER: "center",
      MAX: "flex-end",
      SPACE_BETWEEN: "space-between",
    };
    const alignMap: Record<string, string> = {
      MIN: "flex-start",
      CENTER: "center",
      MAX: "flex-end",
      BASELINE: "baseline",
    };

    if (node.primaryAxisAlignItems) {
      css["justify-content"] = justifyMap[node.primaryAxisAlignItems] || "flex-start";
    }
    if (node.counterAxisAlignItems) {
      css["align-items"] = alignMap[node.counterAxisAlignItems] || "flex-start";
    }
  }

  const pt = node.paddingTop ?? 0;
  const pr = node.paddingRight ?? 0;
  const pb = node.paddingBottom ?? 0;
  const pl = node.paddingLeft ?? 0;
  if (pt || pr || pb || pl) {
    if (pt === pr && pr === pb && pb === pl) {
      css["padding"] = `${pt}px`;
    } else {
      css["padding"] = `${pt}px ${pr}px ${pb}px ${pl}px`;
    }
  }

  if (node.cornerRadius) {
    css["border-radius"] = `${node.cornerRadius}px`;
  } else if (node.rectangleCornerRadii) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii;
    css["border-radius"] = `${tl}px ${tr}px ${br}px ${bl}px`;
  }

  if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
    const stroke = node.strokes.find((s) => s.visible !== false);
    if (stroke?.color) {
      css["border"] = `${node.strokeWeight}px solid ${colorToRgba(stroke.color)}`;
    }
  }

  if (node.opacity !== undefined && node.opacity < 1) {
    css["opacity"] = String(node.opacity);
  }

  if (node.clipsContent) {
    css["overflow"] = "hidden";
  }

  return css;
}

export function generateCSS(node: FigmaNode): CSSMapping {
  const css: CSSMapping = {};

  Object.assign(css, mapLayout(node));

  if (node.fills && node.fills.length > 0) {
    Object.assign(css, mapFills(node.fills));
  }

  if (node.style) {
    Object.assign(css, mapTypography(node.style));
  }

  if (node.effects && node.effects.length > 0) {
    Object.assign(css, mapEffects(node.effects));
  }

  return css;
}
