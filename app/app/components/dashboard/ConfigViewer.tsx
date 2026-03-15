import { useState, useCallback } from "react";
import { Button } from "~/components/ui/Button";

export interface ConfigViewerProps {
  configs: Record<string, string>;
}

export function ConfigViewer({ configs }: ConfigViewerProps) {
  const filenames = Object.keys(configs);
  const [activeTab, setActiveTab] = useState(filenames[0] ?? "");

  const handleCopy = useCallback(async () => {
    const content = configs[activeTab];
    if (content) {
      await navigator.clipboard.writeText(content);
    }
  }, [configs, activeTab]);

  const handleDownload = useCallback(() => {
    const content = configs[activeTab];
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab;
    a.click();
    URL.revokeObjectURL(url);
  }, [configs, activeTab]);

  if (filenames.length === 0) {
    return (
      <div className="rounded-xl border border-guard-700/50 bg-guard-900/60 p-8 text-center text-sm text-guard-500">
        No configs generated yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-guard-700/50">
      {/* Tabs */}
      <div className="flex items-center gap-0 overflow-x-auto border-b border-guard-700/50 bg-guard-800">
        {filenames.map((filename) => (
          <button
            key={filename}
            onClick={() => setActiveTab(filename)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === filename
                ? "border-catalyst-500 text-catalyst-400"
                : "border-transparent text-guard-400 hover:text-guard-200"
            }`}
          >
            {filename}
          </button>
        ))}

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2 px-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-guard-400 hover:text-catalyst-400 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
              />
            </svg>
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-guard-400 hover:text-catalyst-400 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-guard-950 p-6">
        <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-catalyst-300">
          <code>{configs[activeTab]}</code>
        </pre>
      </div>
    </div>
  );
}
