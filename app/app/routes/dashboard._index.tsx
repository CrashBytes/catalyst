import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, Link, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import { getProjectsByUserId } from "~/services/project.server";
import {
  getAnalysisCountThisMonth,
  getRecentAnalyses,
} from "~/services/analysis.server";
import { getUserById } from "~/services/user.server";
import { PLANS } from "~/lib/plans";

export const meta: MetaFunction = () => {
  return [
    { title: "Overview - Catalyst" },
    { name: "description", content: "Your Catalyst dashboard overview." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);

  const [user, projects, analysisCount, recentAnalyses] = await Promise.all([
    getUserById(db, userId),
    getProjectsByUserId(db, userId),
    getAnalysisCountThisMonth(db, userId),
    getRecentAnalyses(db, userId, 10),
  ]);

  const plan = PLANS[user?.plan || "free"];

  return json({
    stats: {
      analysesThisMonth: analysisCount,
      analysisLimit:
        plan.limits.analysesPerMonth === -1
          ? "Unlimited"
          : plan.limits.analysesPerMonth,
      totalProjects: projects.length,
      plan: plan.name,
    },
    recentAnalyses,
  });
}

export default function DashboardIndex() {
  const { stats, recentAnalyses } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-guard-400">
        Welcome back. Here&apos;s an overview of your account.
      </p>

      {/* Usage Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
          <p className="text-sm font-medium text-guard-400">
            Analyses This Month
          </p>
          <p className="mt-2 text-3xl font-bold text-guard-100">
            {stats.analysesThisMonth}
          </p>
          <p className="mt-1 text-sm text-guard-500">
            of {stats.analysisLimit}
          </p>
        </div>
        <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
          <p className="text-sm font-medium text-guard-400">Total Projects</p>
          <p className="mt-2 text-3xl font-bold text-guard-100">
            {stats.totalProjects}
          </p>
        </div>
        <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
          <p className="text-sm font-medium text-guard-400">Current Plan</p>
          <p className="mt-2 text-3xl font-bold text-guard-100">{stats.plan}</p>
          <Link
            to="/dashboard/billing"
            className="mt-1 text-sm text-catalyst-400 hover:text-catalyst-300"
          >
            Manage plan
          </Link>
        </div>
        <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
          <p className="text-sm font-medium text-guard-400">Recent Analyses</p>
          <p className="mt-2 text-3xl font-bold text-guard-100">
            {recentAnalyses.length}
          </p>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-guard-100">
            Recent Analyses
          </h2>
          <Link
            to="/dashboard/projects"
            className="text-sm text-catalyst-400 hover:text-catalyst-300"
          >
            View all projects
          </Link>
        </div>
        {recentAnalyses.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-guard-700/50 bg-guard-900/50 p-8 text-center">
            <p className="text-sm text-guard-400">
              No analyses yet. Create a project and run your first analysis.
            </p>
            <Link
              to="/dashboard/projects"
              className="mt-4 inline-flex rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-guard-700/50 bg-guard-900/50">
            <table className="min-w-full divide-y divide-guard-700/50">
              <thead className="bg-guard-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Date
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-guard-700/50">
                {recentAnalyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-guard-800/40">
                    <td className="px-6 py-4 text-sm text-guard-100">
                      {(analysis as unknown as { project_name: string })
                        .project_name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-guard-400 capitalize">
                      {analysis.type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          analysis.status === "completed"
                            ? "bg-green-900/50 text-green-400"
                            : analysis.status === "failed"
                            ? "bg-red-900/50 text-red-400"
                            : "bg-yellow-900/50 text-yellow-400"
                        }`}
                      >
                        {analysis.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-guard-500">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/dashboard/analyses/${analysis.id}`}
                        className="text-sm text-catalyst-400 hover:text-catalyst-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
