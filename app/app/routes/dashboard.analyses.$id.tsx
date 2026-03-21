import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, Link, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import { getAnalysisById } from "~/services/analysis.server";
import { useState } from "react";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const analysisId = args.params.id;

  if (!analysisId) {
    throw new Response("Analysis ID is required", { status: 400 });
  }

  const analysis = await getAnalysisById(db, analysisId, userId);
  if (!analysis) {
    throw new Response("Analysis not found", { status: 404 });
  }

  // Parse configs JSON if present
  let configs: Record<string, string> = {};
  if (analysis.configs) {
    try {
      configs = JSON.parse(analysis.configs);
    } catch {
      configs = { raw: analysis.configs };
    }
  }

  let results: Record<string, unknown> | null = null;
  if (analysis.results) {
    try {
      results = JSON.parse(analysis.results);
    } catch {
      results = { raw: analysis.results };
    }
  }

  return json({ analysis, configs, results });
}

export default function AnalysisDetailPage() {
  const { analysis, configs, results } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<string>(
    Object.keys(configs)[0] || ""
  );

  const configKeys = Object.keys(configs);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-guard-500">
        <Link to="/dashboard" className="hover:text-guard-300">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/dashboard/projects/${analysis.project_id}`}
          className="hover:text-guard-300"
        >
          Project
        </Link>
        <span className="mx-2">/</span>
        <span className="text-guard-100">Analysis</span>
      </nav>

      {/* Analysis Metadata */}
      <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Analysis Details
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-guard-400">
              <span>
                <span className="font-medium">Type:</span>{" "}
                <span className="capitalize">{analysis.type}</span>
              </span>
              <span>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    analysis.status === "completed"
                      ? "bg-green-900/50 text-green-400"
                      : analysis.status === "failed"
                      ? "bg-red-900/50 text-red-400"
                      : "bg-yellow-900/50 text-yellow-400"
                  }`}
                >
                  {analysis.status}
                </span>
              </span>
              <span>
                <span className="font-medium">Created:</span>{" "}
                {new Date(analysis.created_at).toLocaleString()}
              </span>
              {analysis.completed_at && (
                <span>
                  <span className="font-medium">Completed:</span>{" "}
                  {new Date(analysis.completed_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {analysis.summary && (
          <div className="mt-4 rounded-lg bg-guard-800/60 p-4">
            <h3 className="text-sm font-medium text-guard-300">Summary</h3>
            <p className="mt-1 text-sm text-guard-400">{analysis.summary}</p>
          </div>
        )}
      </div>

      {/* Config Viewer */}
      {configKeys.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-guard-100 mb-4">
            Generated Configs
          </h2>
          <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-guard-700/50 overflow-x-auto">
              {configKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? "border-catalyst-500 text-catalyst-400"
                      : "border-transparent text-guard-500 hover:border-guard-600 hover:text-guard-300"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4">
              <pre className="overflow-x-auto rounded-lg bg-guard-950 p-4 text-sm text-guard-100">
                <code>
                  {typeof configs[activeTab] === "string"
                    ? configs[activeTab]
                    : JSON.stringify(configs[activeTab], null, 2)}
                </code>
              </pre>
              <button
                onClick={() => {
                  const content =
                    typeof configs[activeTab] === "string"
                      ? configs[activeTab]
                      : JSON.stringify(configs[activeTab], null, 2);
                  navigator.clipboard.writeText(content);
                }}
                className="mt-3 rounded-lg border border-guard-700/50 px-3 py-1.5 text-sm font-medium text-guard-300 hover:bg-guard-800/60"
              >
                Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Viewer */}
      {results && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-guard-100 mb-4">
            Analysis Results
          </h2>
          <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-4">
            <pre className="overflow-x-auto rounded-lg bg-guard-950 p-4 text-sm text-guard-100">
              <code>{JSON.stringify(results, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-6">
      <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
      <p className="mt-2 text-sm text-guard-400">
        {isRouteErrorResponse(error)
          ? `${error.status}: ${error.data}`
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
      </p>
      <a href="/dashboard" className="mt-4 inline-block text-sm text-catalyst-400 hover:text-catalyst-300">
        Back to dashboard
      </a>
    </div>
  );
}
