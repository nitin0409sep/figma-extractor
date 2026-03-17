// Figma API types

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaPaint {
  type: string;
  color?: FigmaColor;
  opacity?: number;
  visible?: boolean;
  blendMode?: string;
  gradientStops?: { position: number; color: FigmaColor }[];
  scaleMode?: string;
  imageRef?: string;
}

export interface FigmaEffect {
  type: string;
  visible?: boolean;
  color?: FigmaColor;
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
  blendMode?: string;
}

export interface FigmaTypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontWeight: number;
  fontSize: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  letterSpacing: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightUnit?: string;
  textDecoration?: string;
  textCase?: string;
}

export interface FigmaConstraint {
  type: string;
  value: number;
}

export interface FigmaLayoutConstraint {
  vertical: string;
  horizontal: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];

  // Geometry
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  size?: { x: number; y: number };
  relativeTransform?: number[][];

  // Style
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeAlign?: string;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  opacity?: number;
  effects?: FigmaEffect[];
  blendMode?: string;
  clipsContent?: boolean;

  // Text
  characters?: string;
  style?: FigmaTypeStyle;

  // Layout
  layoutMode?: string; // HORIZONTAL | VERTICAL | NONE
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;

  // Constraints
  constraints?: FigmaLayoutConstraint;

  // Component
  componentId?: string;
  componentProperties?: Record<string, unknown>;
}

export interface FigmaFileResponse {
  name: string;
  lastModified: string;
  document: FigmaNode;
  components: Record<string, { key: string; name: string; description: string }>;
  styles: Record<string, { key: string; name: string; styleType: string; description: string }>;
}

export interface FigmaNodesResponse {
  name: string;
  lastModified: string;
  nodes: Record<string, { document: FigmaNode }>;
}

// Output types

export interface CSSMapping {
  [property: string]: string;
}

export interface DesignNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  dimensions: { width: number; height: number };
  position: { x: number; y: number };
  styles: {
    fills: FigmaPaint[];
    strokes: FigmaPaint[];
    strokeWeight?: number;
    cornerRadius?: number;
    rectangleCornerRadii?: number[];
    opacity?: number;
    effects: FigmaEffect[];
    typography?: FigmaTypeStyle;
  };
  text?: string;
  autoLayout?: {
    direction: string;
    gap: number;
    padding: { top: number; right: number; bottom: number; left: number };
    primaryAxisAlign: string;
    counterAxisAlign: string;
  };
  css: CSSMapping;
  tailwind: string;
  componentSuggestion: {
    tag: string;
    props: Record<string, string>;
    isComponent: boolean;
    componentName?: string;
  };
  children: DesignNode[];
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
    letterSpacing: string;
  }>;
  spacing: string[];
}

export interface ExtractedDesign {
  fileKey: string;
  fileName: string;
  lastModified: string;
  nodes: DesignNode[];
  designTokens: DesignTokens;
  componentTree: Record<string, string>;
}
