import { FigmaNode } from "@/types/figma";

interface ComponentSuggestion {
  tag: string;
  props: Record<string, string>;
  isComponent: boolean;
  componentName?: string;
}

const NODE_TYPE_TAG_MAP: Record<string, string> = {
  FRAME: "div",
  GROUP: "div",
  RECTANGLE: "div",
  ELLIPSE: "div",
  LINE: "hr",
  TEXT: "p",
  VECTOR: "svg",
  BOOLEAN_OPERATION: "svg",
  COMPONENT: "div",
  INSTANCE: "div",
  SECTION: "section",
};

function inferSemanticTag(node: FigmaNode): string {
  const name = node.name.toLowerCase();

  // Navigation
  if (name.includes("nav") || name.includes("menu")) return "nav";
  if (name.includes("header")) return "header";
  if (name.includes("footer")) return "footer";
  if (name.includes("sidebar") || name.includes("aside")) return "aside";
  if (name.includes("main") || name.includes("content")) return "main";

  // Interactive
  if (name.includes("button") || name.includes("btn") || name.includes("cta")) return "button";
  if (name.includes("link")) return "a";
  if (name.includes("input") || name.includes("field") || name.includes("textfield"))
    return "input";
  if (name.includes("textarea")) return "textarea";
  if (name.includes("select") || name.includes("dropdown")) return "select";
  if (name.includes("checkbox")) return "input";
  if (name.includes("radio")) return "input";

  // Text
  if (node.type === "TEXT") {
    if (name.includes("heading") || name.includes("title") || name.match(/^h[1-6]/)) {
      const levelMatch = name.match(/[1-6]/);
      return levelMatch ? `h${levelMatch[0]}` : "h2";
    }
    if (name.includes("label")) return "label";
    if (name.includes("span")) return "span";
    return "p";
  }

  // Media
  if (
    name.includes("image") ||
    name.includes("img") ||
    name.includes("photo") ||
    name.includes("avatar")
  )
    return "img";
  if (name.includes("icon")) return "svg";
  if (name.includes("video")) return "video";

  // Containers
  if (name.includes("list")) return "ul";
  if (name.includes("item") && name.includes("list")) return "li";
  if (name.includes("card")) return "article";
  if (name.includes("modal") || name.includes("dialog")) return "dialog";
  if (name.includes("form")) return "form";
  if (name.includes("section")) return "section";

  return NODE_TYPE_TAG_MAP[node.type] || "div";
}

function toComponentName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function generateComponentSuggestion(
  node: FigmaNode,
  tailwindClasses: string,
): ComponentSuggestion {
  const tag = inferSemanticTag(node);
  const isComponent = node.type === "COMPONENT" || node.type === "INSTANCE";

  const props: Record<string, string> = {};
  if (tailwindClasses) {
    props.className = tailwindClasses;
  }

  if (tag === "img") {
    props.src = "";
    props.alt = node.name;
  }
  if (tag === "a") {
    props.href = "#";
  }
  if (tag === "input") {
    if (node.name.toLowerCase().includes("checkbox")) {
      props.type = "checkbox";
    } else if (node.name.toLowerCase().includes("radio")) {
      props.type = "radio";
    } else {
      props.type = "text";
    }
  }

  return {
    tag,
    props,
    isComponent,
    componentName: isComponent ? toComponentName(node.name) : undefined,
  };
}

export function buildComponentTree(
  nodes: { id: string; name: string; type: string; componentSuggestion: ComponentSuggestion }[],
): Record<string, string> {
  const components: Record<string, string> = {};

  for (const node of nodes) {
    if (node.componentSuggestion.isComponent && node.componentSuggestion.componentName) {
      components[node.id] = node.componentSuggestion.componentName;
    }
  }

  return components;
}
