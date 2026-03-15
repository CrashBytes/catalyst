import { queryOne, queryAll, execute } from "~/lib/db.server";

export interface Project {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  repo_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProjectsByUserId(
  db: D1Database,
  userId: string
): Promise<Project[]> {
  return queryAll<Project>(
    db,
    "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
    [userId]
  );
}

export async function getProjectById(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<Project | null> {
  return queryOne<Project>(
    db,
    "SELECT * FROM projects WHERE id = ? AND (user_id = ? OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = ?))",
    [projectId, userId, userId]
  );
}

export async function createProject(
  db: D1Database,
  project: {
    id: string;
    userId: string;
    name: string;
    description?: string;
    repoUrl?: string;
    organizationId?: string;
  }
): Promise<void> {
  await execute(
    db,
    "INSERT INTO projects (id, user_id, name, description, repo_url, organization_id) VALUES (?, ?, ?, ?, ?, ?)",
    [
      project.id,
      project.userId,
      project.name,
      project.description || null,
      project.repoUrl || null,
      project.organizationId || null,
    ]
  );
}

export async function updateProject(
  db: D1Database,
  projectId: string,
  data: { name?: string; description?: string; repoUrl?: string }
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (data.name !== undefined) {
    sets.push("name = ?");
    params.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    params.push(data.description);
  }
  if (data.repoUrl !== undefined) {
    sets.push("repo_url = ?");
    params.push(data.repoUrl);
  }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  params.push(projectId);

  await execute(
    db,
    `UPDATE projects SET ${sets.join(", ")} WHERE id = ?`,
    params
  );
}

export async function deleteProject(
  db: D1Database,
  projectId: string
): Promise<void> {
  await execute(db, "DELETE FROM projects WHERE id = ?", [projectId]);
}
