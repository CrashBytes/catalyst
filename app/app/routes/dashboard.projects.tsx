import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form, Link, useNavigation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import {
  getProjectsByUserId,
  createProject,
  deleteProject,
} from "~/services/project.server";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Projects - Catalyst" },
    { name: "description", content: "Manage your codebase analysis projects." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const projects = await getProjectsByUserId(db, userId);

  return json({ projects });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const formData = await args.request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "create") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const repoUrl = formData.get("repoUrl") as string | null;

    if (!name || name.trim().length === 0) {
      return json({ error: "Project name is required." }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return json({ error: "Project name must be 100 characters or less." }, { status: 400 });
    }

    if (description && description.trim().length > 500) {
      return json({ error: "Description must be 500 characters or less." }, { status: 400 });
    }

    if (repoUrl && repoUrl.trim().length > 0 && !repoUrl.trim().startsWith("https://")) {
      return json({ error: "Repository URL must start with https://." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await createProject(db, {
      id,
      userId,
      name: name.trim(),
      description: description?.trim() || undefined,
      repoUrl: repoUrl?.trim() || undefined,
    });

    return json({ success: true, projectId: id });
  }

  if (intent === "delete") {
    const projectId = formData.get("projectId") as string;
    if (!projectId) {
      return json({ error: "Project ID is required." }, { status: 400 });
    }

    await deleteProject(db, projectId);
    return json({ success: true });
  }

  return json({ error: "Invalid action." }, { status: 400 });
}

export default function ProjectsPage() {
  const { projects } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-guard-400">
            Manage your codebase analysis projects.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500 transition-colors"
        >
          New Project
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="mt-6 rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
          <h2 className="text-lg font-semibold text-guard-100">
            Create a new project
          </h2>
          <Form method="post" className="mt-4 space-y-4">
            <input type="hidden" name="intent" value="create" />
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-guard-300"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
                placeholder="My Project"
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
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
                placeholder="A brief description of your project..."
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
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
                placeholder="https://github.com/user/repo"
              />
            </div>
            {actionData && "error" in actionData && (
              <p className="text-sm text-red-400">{actionData.error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-guard-700/50 px-4 py-2 text-sm font-medium text-guard-300 hover:bg-guard-800/60"
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Projects List */}
      <div className="mt-6">
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-guard-700/50 bg-guard-900/50 p-8 text-center">
            <p className="text-sm text-guard-400">
              No projects yet. Create your first project to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6 hover:border-guard-600 transition-colors"
              >
                <Link to={`/dashboard/projects/${project.id}`}>
                  <h3 className="text-base font-semibold text-guard-100 hover:text-catalyst-400">
                    {project.name}
                  </h3>
                </Link>
                {project.description && (
                  <p className="mt-1 text-sm text-guard-400 line-clamp-2">
                    {project.description}
                  </p>
                )}
                {project.repo_url && (
                  <p className="mt-2 text-xs text-guard-500 truncate">
                    {project.repo_url}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-guard-500">
                    Updated{" "}
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input
                      type="hidden"
                      name="projectId"
                      value={project.id}
                    />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this project?"
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </Form>
                </div>
              </div>
            ))}
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
