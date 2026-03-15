import { queryOne, queryAll, execute } from "~/lib/db.server";

export interface Analysis {
  id: string;
  project_id: string;
  user_id: string;
  type: string;
  status: string;
  summary: string | null;
  results: string | null;
  configs: string | null;
  created_at: string;
  completed_at: string | null;
}

export async function getAnalysesByProjectId(
  db: D1Database,
  projectId: string
): Promise<Analysis[]> {
  return queryAll<Analysis>(
    db,
    "SELECT * FROM analyses WHERE project_id = ? ORDER BY created_at DESC",
    [projectId]
  );
}

export async function getAnalysisById(
  db: D1Database,
  analysisId: string,
  userId: string
): Promise<Analysis | null> {
  return queryOne<Analysis>(
    db,
    "SELECT a.* FROM analyses a JOIN projects p ON a.project_id = p.id WHERE a.id = ? AND (a.user_id = ? OR p.organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = ?))",
    [analysisId, userId, userId]
  );
}

export async function createAnalysis(
  db: D1Database,
  analysis: {
    id: string;
    projectId: string;
    userId: string;
    type: string;
  }
): Promise<void> {
  await execute(
    db,
    "INSERT INTO analyses (id, project_id, user_id, type) VALUES (?, ?, ?, ?)",
    [analysis.id, analysis.projectId, analysis.userId, analysis.type]
  );
}

export async function completeAnalysis(
  db: D1Database,
  analysisId: string,
  data: { summary: string; results: string; configs: string }
): Promise<void> {
  await execute(
    db,
    "UPDATE analyses SET status = 'completed', summary = ?, results = ?, configs = ?, completed_at = datetime('now') WHERE id = ?",
    [data.summary, data.results, data.configs, analysisId]
  );
}

export async function failAnalysis(
  db: D1Database,
  analysisId: string,
  summary: string
): Promise<void> {
  await execute(
    db,
    "UPDATE analyses SET status = 'failed', summary = ?, completed_at = datetime('now') WHERE id = ?",
    [summary, analysisId]
  );
}

export async function getAnalysisCountThisMonth(
  db: D1Database,
  userId: string
): Promise<number> {
  const result = await queryOne<{ count: number }>(
    db,
    "SELECT COUNT(*) as count FROM analyses WHERE user_id = ? AND created_at >= datetime('now', 'start of month')",
    [userId]
  );
  return result?.count || 0;
}

export async function getRecentAnalyses(
  db: D1Database,
  userId: string,
  limit: number = 10
): Promise<Analysis[]> {
  return queryAll<Analysis>(
    db,
    "SELECT a.*, p.name as project_name FROM analyses a JOIN projects p ON a.project_id = p.id WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT ?",
    [userId, limit]
  );
}
