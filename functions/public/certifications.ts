import { getDb, json, serverError } from "../api/_utils";

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare(
        "SELECT id, name, year, issued_by, credential_id, verify_link, file_key, status, created_at, updated_at FROM certifications WHERE status = 'published' ORDER BY updated_at DESC"
      )
      .all();

    return json({ ok: true, data: results ?? [] });
  } catch (error) {
    return serverError("Failed to fetch certifications");
  }
};
