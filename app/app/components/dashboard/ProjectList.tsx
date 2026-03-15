import { Link } from "@remix-run/react";
import { Card, CardBody } from "~/components/ui/Card";

export interface Project {
  id: string;
  name: string;
  description?: string;
  lastAnalysisAt?: string;
  analysisCount: number;
}

export interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-guard-700/50 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-guard-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-semibold text-guard-600">
          No projects yet
        </h3>
        <p className="mt-1 text-sm text-guard-600">
          Run your first analysis to create a project.
        </p>
        <button className="mt-4 rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500 transition-colors">
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.id} to={`/dashboard/projects/${project.id}`}>
          <Card className="glass rounded-xl transition-all hover:border-catalyst-600/30">
            <CardBody>
              <h3 className="text-base font-semibold text-guard-100">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-1 text-sm text-guard-400 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-guard-500">
                <span>
                  {project.analysisCount}{" "}
                  {project.analysisCount === 1 ? "analysis" : "analyses"}
                </span>
                {project.lastAnalysisAt && (
                  <span>
                    Last:{" "}
                    {new Date(project.lastAnalysisAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}
