import { FigmaFileResponse, FigmaNodesResponse } from "@/types/figma";

const FIGMA_API_BASE = "https://api.figma.com/v1";

export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } {
  // Supports:
  //   https://www.figma.com/file/FILEKEY/Title
  //   https://www.figma.com/design/FILEKEY/Title
  //   https://www.figma.com/design/FILEKEY/Title?node-id=1-2
  const fileMatch = url.match(/figma\.com\/(?:file|design|board|proto)\/([a-zA-Z0-9]+)/);
  if (!fileMatch) {
    throw new Error(
      "Invalid Figma URL. Expected format: https://www.figma.com/design/FILE_KEY/... or https://www.figma.com/board/FILE_KEY/...",
    );
  }
  const fileKey = fileMatch[1];

  const nodeMatch = url.match(/node-id=([^&]+)/);
  // Figma URLs use dashes (942-2159) but the API expects colons (942:2159)
  const nodeId = nodeMatch ? decodeURIComponent(nodeMatch[1]).replace(/-/g, ":") : undefined;

  return { fileKey, nodeId };
}

export async function fetchFile(fileKey: string, token: string): Promise<FigmaFileResponse> {
  const res = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
    headers: { "X-Figma-Token": token },
  });

  if (!res.ok) {
    if (res.status === 403) throw new Error("Invalid Figma token or no access to this file.");
    if (res.status === 404) throw new Error("Figma file not found. Check the URL.");
    if (res.status === 429)
      throw new Error("Rate limited by Figma API. Please wait and try again.");
    throw new Error(`Figma API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchFileNodes(
  fileKey: string,
  nodeIds: string[],
  token: string,
): Promise<FigmaNodesResponse> {
  const ids = nodeIds.join(",");
  const res = await fetch(
    `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`,
    { headers: { "X-Figma-Token": token } },
  );

  if (!res.ok) {
    if (res.status === 403) throw new Error("Invalid Figma token or no access to this file.");
    if (res.status === 404) throw new Error("Figma file not found. Check the URL.");
    if (res.status === 429)
      throw new Error("Rate limited by Figma API. Please wait and try again.");
    throw new Error(`Figma API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchImages(
  fileKey: string,
  nodeIds: string[],
  token: string,
): Promise<Record<string, string>> {
  if (nodeIds.length === 0) return {};

  const ids = nodeIds.join(",");
  const res = await fetch(
    `${FIGMA_API_BASE}/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png`,
    { headers: { "X-Figma-Token": token } },
  );

  if (!res.ok) return {};

  const data = await res.json();
  return data.images || {};
}
