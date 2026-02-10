import { getDb, json, serverError } from "../api/_utils";

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare(
        "SELECT id, title, summary, slug, status, content, reading_time, date, author, created_at, updated_at FROM blogs WHERE status = 'published' ORDER BY COALESCE(date, updated_at) DESC"
      )
      .all();

    return json({ ok: true, data: results ?? [] });
  } catch (error) {
    return serverError("Failed to fetch blog posts");
  }
};
