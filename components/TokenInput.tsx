"use client";

import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (token: string) => void;
}

export default function TokenInput({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("figma_pat");
    if (saved) onChange(saved);
  }, [onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(val: string) {
    onChange(val);
    localStorage.setItem("figma_pat", val);
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="figma-token-input"
        className="block text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Figma Personal Access Token
      </label>
      <div className="flex gap-2">
        <input
          id="figma-token-input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="figd_..."
          className="input-base flex-1"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="btn-secondary shrink-0"
        >
          {visible ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="inline-block mr-1 -mt-0.5"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Stored locally in your browser. Never sent to our servers.
      </p>
    </div>
  );
}
