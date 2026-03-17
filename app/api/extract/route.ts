import { NextRequest, NextResponse } from "next/server";
import { fetchFile, fetchFileNodes, parseFigmaUrl } from "@/lib/figma-client";
import { parseDesign, parseDesignFromNodes } from "@/lib/parser";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateFigmaToken, validateFigmaUrl } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${retryAfter}s.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const body = await req.json();
    const { url, token } = body;

    const urlValidation = validateFigmaUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    const tokenValidation = validateFigmaToken(token);
    if (!tokenValidation.valid) {
      return NextResponse.json({ error: tokenValidation.error }, { status: 400 });
    }

    const { fileKey, nodeId } = parseFigmaUrl(url.trim());

    if (nodeId) {
      const nodesData = await fetchFileNodes(fileKey, [nodeId], token.trim());
      const result = parseDesignFromNodes(fileKey, nodesData, nodeId);
      return NextResponse.json(result);
    }

    const fileData = await fetchFile(fileKey, token.trim());
    const result = parseDesign(fileKey, fileData);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unknown error occurred.";

    if (message.includes("Invalid Figma URL") || message.includes("Invalid token")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message.includes("no access") || message.includes("Invalid Figma token")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("Rate limited")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
