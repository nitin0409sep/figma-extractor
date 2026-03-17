"use client";

interface Props {
  value: string;
  onChange: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function LinkInput({ value, onChange, onSubmit, loading }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-400">
        Figma Design URL
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) onSubmit();
          }}
          placeholder="https://www.figma.com/design/..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-5 py-2 text-sm font-medium bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Extracting...
            </span>
          ) : (
            "Extract"
          )}
        </button>
      </div>
    </div>
  );
}
