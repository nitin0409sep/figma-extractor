import { NextRequest, NextResponse } from "next/server";
import { parseFigmaUrl, fetchFile } from "@/lib/figma-client";
import { parseDesign } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, token } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Figma URL is required." }, { status: 400 });
    }
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Figma Personal Access Token is required." }, { status: 400 });
    }

    const { fileKey } = parseFigmaUrl(url);
    const fileData = await fetchFile(fileKey, token);
    const result = parseDesign(fileKey, fileData);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unknown error occurred.";
    const status = message.includes("Invalid Figma URL") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
