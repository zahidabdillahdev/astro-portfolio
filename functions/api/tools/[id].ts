import { badRequest, getDb, json, notFound, serverError } from "../_utils";

type ToolInput = {
  name?: string;
  icon?: string;
  status?: "draft" | "published";
};

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing tool id");
    }

    const body = (await context.request.json()) as ToolInput;
    if (!body || Object.keys(body).length === 0) {
      return badRequest("Payload is required");
    }

    const db = getDb(context);
    const existing = await db
      .prepare("SELECT id FROM tools WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return notFound("Tool not found");
    }

    const name = body.name ?? null;
    const icon = body.icon ?? null;
    const status = body.status ?? null;

    await db
      .prepare(
        "UPDATE tools SET name = COALESCE(?, name), icon = COALESCE(?, icon), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(name, icon, status, id)
      .run();

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to update tool");
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing tool id");
    }

    const db = getDb(context);
    const result = await db
      .prepare("DELETE FROM tools WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return notFound("Tool not found");
    }

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to delete tool");
  }
};
