import { getDb, json, serverError } from "../api/_utils";

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare(
        "SELECT id, name, summary, tags, href, status, created_at, updated_at FROM projects WHERE status = 'published' ORDER BY updated_at DESC"
      )
      .all();

    const data =
      results?.map((row: any) => ({
        ...row,
        tags: (() => {
          try {
            return JSON.parse(row.tags ?? "[]");
          } catch {
            return [];
          }
        })(),
      })) ?? [];

    return json({ ok: true, data });
  } catch (error) {
    return serverError("Failed to fetch projects");
  }
};
