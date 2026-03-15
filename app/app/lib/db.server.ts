import type { AppLoadContext } from "@remix-run/cloudflare";

export function getDb(context: AppLoadContext) {
  return (context.cloudflare.env as unknown as Env).DB;
}

export async function queryOne<T>(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const result = await db
    .prepare(sql)
    .bind(...params)
    .first<T>();
  return result;
}

export async function queryAll<T>(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<T>();
  return result.results;
}

export async function execute(
  db: D1Database,
  sql: string,
  params: unknown[] = []
) {
  return db
    .prepare(sql)
    .bind(...params)
    .run();
}
