import { getDb, json, serverError } from "../api/_utils";

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const row = await db
      .prepare(
        "SELECT avatar_key, photo_key, resume_key, summary, updated_at FROM profile_assets WHERE id = 1"
      )
      .first();

    return json({ ok: true, data: row ?? null });
  } catch (error) {
    return serverError("Failed to fetch profile assets");
  }
};
