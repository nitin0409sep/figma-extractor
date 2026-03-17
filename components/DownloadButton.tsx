"use client";

import { ExtractedDesign } from "@/types/figma";

interface Props {
  data: ExtractedDesign;
}

export default function DownloadButton({ data }: Props) {
  function download() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.fileName.replace(/\s+/g, "-").toLowerCase()}-design.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="px-4 py-2 text-sm font-medium bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
    >
      Download JSON
    </button>
  );
}
