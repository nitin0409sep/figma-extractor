"use client";

import { useState, useEffect } from "react";

interface Props {
  value: string;
  onChange: (token: string) => void;
}

export default function TokenInput({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("figma_pat");
    if (saved) onChange(saved);
  }, []);

  function handleChange(val: string) {
    onChange(val);
    localStorage.setItem("figma_pat", val);
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-400">
        Figma Personal Access Token
      </label>
      <div className="flex gap-2">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="figd_..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Stored in your browser&apos;s localStorage. Never sent to our servers.
      </p>
    </div>
  );
}
