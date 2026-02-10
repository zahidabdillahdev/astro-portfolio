import { getDb, json, serverError } from "../_utils";

type ProfilePayload = {
  avatar_key?: string | null;
  photo_key?: string | null;
  resume_key?: string | null;
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const row = await db
      .prepare(
        "SELECT avatar_key, photo_key, resume_key, updated_at FROM profile_assets WHERE id = 1"
      )
      .first();

    return json({ ok: true, data: row ?? null });
  } catch (error) {
    return serverError("Failed to fetch profile assets");
  }
};

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as ProfilePayload;
    const avatarKey = body.avatar_key ?? null;
    const photoKey = body.photo_key ?? null;
    const resumeKey = body.resume_key ?? null;

    const db = getDb(context);
    await db
      .prepare(
        "INSERT INTO profile_assets (id, avatar_key, photo_key, resume_key) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET avatar_key = COALESCE(?, avatar_key), photo_key = COALESCE(?, photo_key), resume_key = COALESCE(?, resume_key), updated_at = CURRENT_TIMESTAMP"
      )
      .bind(
        avatarKey,
        photoKey,
        resumeKey,
        avatarKey,
        photoKey,
        resumeKey
      )
      .run();

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to update profile assets");
  }
};
