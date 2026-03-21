import { queryOne, queryAll, execute } from "~/lib/db.server";

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  owner_id: string;
  stripe_customer_id: string | null;
  max_seats: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: number;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export async function getOrganizationById(
  db: D1Database,
  orgId: string
): Promise<Organization | null> {
  return queryOne<Organization>(
    db,
    "SELECT * FROM organizations WHERE id = ?",
    [orgId]
  );
}

export async function getUserOrganizations(
  db: D1Database,
  userId: string
): Promise<Organization[]> {
  return queryAll<Organization>(
    db,
    "SELECT o.* FROM organizations o JOIN organization_members om ON o.id = om.organization_id WHERE om.user_id = ?",
    [userId]
  );
}

export async function createOrganization(
  db: D1Database,
  org: {
    id: string;
    name: string;
    slug?: string;
    ownerId: string;
  }
): Promise<void> {
  await execute(
    db,
    "INSERT INTO organizations (id, name, slug, owner_id) VALUES (?, ?, ?, ?)",
    [org.id, org.name, org.slug || null, org.ownerId]
  );
  await execute(
    db,
    "INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, 'owner')",
    [org.id, org.ownerId]
  );
}

export async function getOrganizationMembers(
  db: D1Database,
  orgId: string
): Promise<(OrganizationMember & { email: string; name: string | null })[]> {
  return queryAll(
    db,
    "SELECT om.*, u.email, u.name FROM organization_members om JOIN users u ON om.user_id = u.id WHERE om.organization_id = ?",
    [orgId]
  );
}

export async function addOrganizationMember(
  db: D1Database,
  orgId: string,
  userId: string,
  role: string = "member"
): Promise<void> {
  await execute(
    db,
    "INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?) ON CONFLICT(organization_id, user_id) DO UPDATE SET role = ?",
    [orgId, userId, role, role]
  );
}

export async function removeOrganizationMember(
  db: D1Database,
  orgId: string,
  userId: string
): Promise<void> {
  await execute(
    db,
    "DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?",
    [orgId, userId]
  );
}

export async function getMemberCount(
  db: D1Database,
  orgId: string
): Promise<number> {
  const result = await queryOne<{ count: number }>(
    db,
    "SELECT COUNT(*) as count FROM organization_members WHERE organization_id = ?",
    [orgId]
  );
  return result?.count || 0;
}

export async function getMemberRole(
  db: D1Database,
  orgId: string,
  userId: string
): Promise<string | null> {
  const result = await queryOne<{ role: string }>(
    db,
    "SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?",
    [orgId, userId]
  );
  return result?.role || null;
}
