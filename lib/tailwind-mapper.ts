import { CSSMapping } from "@/types/figma";

const SPACING_MAP: Record<number, string> = {
  0: "0",
  1: "px",
  2: "0.5",
  4: "1",
  6: "1.5",
  8: "2",
  10: "2.5",
  12: "3",
  14: "3.5",
  16: "4",
  20: "5",
  24: "6",
  28: "7",
  32: "8",
  36: "9",
  40: "10",
  44: "11",
  48: "12",
  56: "14",
  64: "16",
  80: "20",
  96: "24",
  112: "28",
  128: "32",
  144: "36",
  160: "40",
  176: "44",
  192: "48",
  208: "52",
  224: "56",
  240: "60",
  256: "64",
  288: "72",
  320: "80",
  384: "96",
};

const FONT_SIZE_MAP: Record<number, string> = {
  12: "xs",
  14: "sm",
  16: "base",
  18: "lg",
  20: "xl",
  24: "2xl",
  30: "3xl",
  36: "4xl",
  48: "5xl",
  60: "6xl",
  72: "7xl",
  96: "8xl",
  128: "9xl",
};

const FONT_WEIGHT_MAP: Record<number, string> = {
  100: "thin",
  200: "extralight",
  300: "light",
  400: "normal",
  500: "medium",
  600: "semibold",
  700: "bold",
  800: "extrabold",
  900: "black",
};

const BORDER_RADIUS_MAP: Record<number, string> = {
  0: "rounded-none",
  2: "rounded-sm",
  4: "rounded",
  6: "rounded-md",
  8: "rounded-lg",
  12: "rounded-xl",
  16: "rounded-2xl",
  24: "rounded-3xl",
  9999: "rounded-full",
};

function closestSpacing(px: number): string {
  const keys = Object.keys(SPACING_MAP).map(Number);
  let closest = keys[0];
  let minDiff = Math.abs(px - closest);
  for (const k of keys) {
    const diff = Math.abs(px - k);
    if (diff < minDiff) {
      minDiff = diff;
      closest = k;
    }
  }
  if (minDiff <= 1) return SPACING_MAP[closest];
  return `[${px}px]`;
}

function closestBorderRadius(px: number): string {
  const keys = Object.keys(BORDER_RADIUS_MAP).map(Number);
  let closest = keys[0];
  let minDiff = Math.abs(px - closest);
  for (const k of keys) {
    const diff = Math.abs(px - k);
    if (diff < minDiff) {
      minDiff = diff;
      closest = k;
    }
  }
  if (minDiff <= 1) return BORDER_RADIUS_MAP[closest];
  return `rounded-[${px}px]`;
}

function colorToTailwindClass(prefix: string, colorStr: string): string {
  // For rgba/rgb colors, use arbitrary value with hex
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const hex =
      "#" +
      [rgbMatch[1], rgbMatch[2], rgbMatch[3]]
        .map((c) => parseInt(c, 10).toString(16).padStart(2, "0"))
        .join("");
    return `${prefix}-[${hex}]`;
  }
  return `${prefix}-[${colorStr}]`;
}

function parsePx(value: string): number {
  return parseFloat(value.replace("px", ""));
}

export function generateTailwind(css: CSSMapping): string {
  const classes: string[] = [];

  // Display + flex
  if (css.display === "flex") {
    classes.push("flex");
    if (css["flex-direction"] === "column") classes.push("flex-col");
    // row is default, no class needed

    if (css["justify-content"]) {
      const map: Record<string, string> = {
        "flex-start": "justify-start",
        center: "justify-center",
        "flex-end": "justify-end",
        "space-between": "justify-between",
        "space-around": "justify-around",
        "space-evenly": "justify-evenly",
      };
      if (map[css["justify-content"]]) classes.push(map[css["justify-content"]]);
    }

    if (css["align-items"]) {
      const map: Record<string, string> = {
        "flex-start": "items-start",
        center: "items-center",
        "flex-end": "items-end",
        baseline: "items-baseline",
        stretch: "items-stretch",
      };
      if (map[css["align-items"]]) classes.push(map[css["align-items"]]);
    }
  }

  // Gap
  if (css.gap) {
    const px = parsePx(css.gap);
    classes.push(`gap-${closestSpacing(px)}`);
  }

  // Width/Height
  if (css.width) {
    const px = parsePx(css.width);
    const sp = closestSpacing(px);
    classes.push(sp.startsWith("[") ? `w-${sp}` : `w-${sp}`);
  }
  if (css.height) {
    const px = parsePx(css.height);
    const sp = closestSpacing(px);
    classes.push(sp.startsWith("[") ? `h-${sp}` : `h-${sp}`);
  }

  // Padding
  if (css.padding) {
    const parts = css.padding.split(" ").map((p) => parsePx(p));
    if (parts.length === 1) {
      classes.push(`p-${closestSpacing(parts[0])}`);
    } else if (parts.length === 4) {
      const [pt, pr, pb, pl] = parts;
      if (pt === pb && pl === pr) {
        classes.push(`py-${closestSpacing(pt)}`);
        classes.push(`px-${closestSpacing(pl)}`);
      } else {
        if (pt) classes.push(`pt-${closestSpacing(pt)}`);
        if (pr) classes.push(`pr-${closestSpacing(pr)}`);
        if (pb) classes.push(`pb-${closestSpacing(pb)}`);
        if (pl) classes.push(`pl-${closestSpacing(pl)}`);
      }
    }
  }

  // Background
  if (css["background-color"]) {
    classes.push(colorToTailwindClass("bg", css["background-color"]));
  }

  // Border radius
  if (css["border-radius"]) {
    const parts = css["border-radius"].split(" ");
    if (parts.length === 1) {
      classes.push(closestBorderRadius(parsePx(parts[0])));
    } else {
      classes.push(`rounded-[${css["border-radius"]}]`);
    }
  }

  // Border
  if (css.border) {
    const match = css.border.match(/(\d+)px solid (.+)/);
    if (match) {
      const width = parseInt(match[1], 10);
      if (width === 1) classes.push("border");
      else classes.push(`border-${width}`);
      classes.push(colorToTailwindClass("border", match[2]));
    }
  }

  // Typography
  if (css["font-size"]) {
    const px = parsePx(css["font-size"]);
    const mapped = FONT_SIZE_MAP[px];
    classes.push(mapped ? `text-${mapped}` : `text-[${px}px]`);
  }
  if (css["font-weight"]) {
    const w = parseInt(css["font-weight"], 10);
    const mapped = FONT_WEIGHT_MAP[w];
    classes.push(mapped ? `font-${mapped}` : `font-[${w}]`);
  }
  if (css["line-height"]) {
    classes.push(`leading-[${css["line-height"]}]`);
  }
  if (css["letter-spacing"]) {
    classes.push(`tracking-[${css["letter-spacing"]}]`);
  }
  if (css["text-align"]) {
    classes.push(`text-${css["text-align"]}`);
  }
  if (css["text-decoration"] === "underline") classes.push("underline");
  if (css["text-decoration"] === "line-through") classes.push("line-through");
  if (css["text-transform"] === "uppercase") classes.push("uppercase");
  if (css["text-transform"] === "lowercase") classes.push("lowercase");

  // Color (text color from fills applied on TEXT nodes)
  if (css.color) {
    classes.push(colorToTailwindClass("text", css.color));
  }

  // Shadow
  if (css["box-shadow"]) {
    // Simplified: just use arbitrary
    classes.push(`shadow-[${css["box-shadow"].replace(/\s+/g, "_")}]`);
  }

  // Blur
  if (css.filter) {
    const match = css.filter.match(/blur\((\d+)px\)/);
    if (match) classes.push(`blur-[${match[1]}px]`);
  }
  if (css["backdrop-filter"]) {
    const match = css["backdrop-filter"].match(/blur\((\d+)px\)/);
    if (match) classes.push(`backdrop-blur-[${match[1]}px]`);
  }

  // Opacity
  if (css.opacity) {
    const val = Math.round(parseFloat(css.opacity) * 100);
    classes.push(`opacity-${val}`);
  }

  // Overflow
  if (css.overflow === "hidden") classes.push("overflow-hidden");

  return classes.join(" ");
}
