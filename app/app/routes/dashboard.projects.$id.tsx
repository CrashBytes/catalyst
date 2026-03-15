import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import {
  useLoaderData,
  useActionData,
  Form,
  Link,
  useNavigate,
} from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "~/services/project.server";
import { getAnalysesByProjectId } from "~/services/analysis.server";
import { useState } from "react";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const projectId = args.params.id;

  if (!projectId) {
    throw new Response("Project ID is required", { status: 400 });
  }

  const project = await getProjectById(db, projectId, userId);
  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }

  const analyses = await getAnalysesByProjectId(db, projectId);

  return json({ project, analyses });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const formData = await args.request.formData();
  const intent = formData.get("intent") as string;
  const projectId = args.params.id;

  if (!projectId) {
    return json({ error: "Project ID is required." }, { status: 400 });
  }

  // Verify ownership
  const project = await getProjectById(db, projectId, userId);
  if (!project) {
    return json({ error: "Project not found." }, { status: 404 });
  }

  if (intent === "update") {
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const repoUrl = formData.get("repoUrl") as string | null;

    await updateProject(db, projectId, {
      name: name?.trim() || undefined,
      description: description?.trim(),
      repoUrl: repoUrl?.trim(),
    });

    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteProject(db, projectId);
    return redirect("/dashboard/projects");
  }

  return json({ error: "Invalid action." }, { status: 400 });
}

export default function ProjectDetailPage() {
  const { project, analyses } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-guard-500">
        <Link to="/dashboard/projects" className="hover:text-guard-300">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-guard-100">{project.name}</span>
      </nav>

      {/* Project Info */}
      <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
        {isEditing ? (
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="update" />
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-guard-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={project.name}
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-guard-300"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={project.description || ""}
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
              />
            </div>
            <div>
              <label
                htmlFor="repoUrl"
                className="block text-sm font-medium text-guard-300"
              >
                Repository URL
              </label>
              <input
                type="url"
                id="repoUrl"
                name="repoUrl"
                defaultValue={project.repo_url || ""}
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
              />
            </div>
            {actionData && "error" in actionData && (
              <p className="text-sm text-red-400">{actionData.error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-guard-700/50 px-4 py-2 text-sm font-medium text-guard-300 hover:bg-guard-800/60"
              >
                Cancel
              </button>
            </div>
          </Form>
        ) : (
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="mt-2 text-sm text-guard-400">
                    {project.description}
                  </p>
                )}
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-catalyst-400 hover:text-catalyst-300"
                  >
                    {project.repo_url}
                  </a>
                )}
                <p className="mt-2 text-xs text-guard-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg border border-guard-700/50 px-3 py-1.5 text-sm font-medium text-guard-300 hover:bg-guard-800/60"
                >
                  Edit
                </button>
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (
                        !confirm(
                          "Are you sure you want to delete this project? All analyses will be lost."
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="rounded-lg border border-red-800 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-900/30"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis History */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-guard-100">Analyses</h2>
          <p className="text-sm text-guard-500">
            Run analyses using the CLI:{" "}
            <code className="rounded bg-guard-800/60 px-2 py-0.5 text-xs text-guard-300">
              npx @crashbytes/catalyst analyze
            </code>
          </p>
        </div>

        {analyses.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-guard-700/50 bg-guard-900/50 p-8 text-center">
            <p className="text-sm text-guard-400">
              No analyses yet. Run your first analysis using the CLI.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-guard-700/50 bg-guard-900/50">
            <table className="min-w-full divide-y divide-guard-700/50">
              <thead className="bg-guard-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Summary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-guard-500">
                    Date
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-guard-700/50">
                {analyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-guard-800/40">
                    <td className="px-6 py-4 text-sm text-guard-100 capitalize">
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
                    <td className="px-6 py-4 text-sm text-guard-400 max-w-xs truncate">
                      {analysis.summary || "--"}
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
