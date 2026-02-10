import { badRequest, getDb, json, serverError } from "../_utils";

type ToolInput = {
  name: string;
  icon: string;
  status?: "draft" | "published";
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare(
        "SELECT id, name, icon, status, created_at, updated_at FROM tools ORDER BY updated_at DESC"
      )
      .all();

    return json({ ok: true, data: results ?? [] });
  } catch (error) {
    return serverError("Failed to fetch tools");
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as ToolInput;

    if (!body?.name || !body?.icon) {
      return badRequest("Tool name and icon are required");
    }

    const status = body.status ?? "draft";
    const db = getDb(context);
    const result = await db
      .prepare("INSERT INTO tools (name, icon, status) VALUES (?, ?, ?)")
      .bind(body.name, body.icon, status)
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (error) {
    return serverError("Failed to create tool");
  }
};
