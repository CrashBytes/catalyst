import { Link } from "@remix-run/react";
import { Card, CardBody } from "~/components/ui/Card";
import { Badge, type BadgeVariant } from "~/components/ui/Badge";

export type AnalysisStatus = "pending" | "running" | "completed" | "failed";

export interface Analysis {
  id: string;
  projectId: string;
  type: string;
  status: AnalysisStatus;
  createdAt: string;
  summary?: string;
}

const statusVariant: Record<AnalysisStatus, BadgeVariant> = {
  pending: "default",
  running: "warning",
  completed: "success",
  failed: "error",
};

const statusLabel: Record<AnalysisStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

export interface AnalysisCardProps {
  analysis: Analysis;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  return (
    <Link
      to={`/dashboard/projects/${analysis.projectId}/analyses/${analysis.id}`}
      className="text-catalyst-400 hover:text-catalyst-300 transition-colors"
    >
      <Card className="glass-light rounded-xl transition-all hover:border-guard-600">
        <CardBody>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-guard-300">
                {analysis.type}
              </p>
              <p className="mt-0.5 text-xs text-guard-500">
                {new Date(analysis.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant={statusVariant[analysis.status]}>
              {statusLabel[analysis.status]}
            </Badge>
          </div>
          {analysis.summary && (
            <p className="mt-3 text-sm text-guard-400 line-clamp-2">
              {analysis.summary}
            </p>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}
