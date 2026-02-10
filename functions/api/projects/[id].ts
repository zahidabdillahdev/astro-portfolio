import { badRequest, getDb, json, notFound, serverError } from "../_utils";

type ProjectInput = {
  name?: string;
  summary?: string;
  tags?: string[];
  href?: string | null;
  status?: "draft" | "published";
};

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing project id");
    }

    const body = (await context.request.json()) as ProjectInput;

    if (!body || Object.keys(body).length === 0) {
      return badRequest("Payload is required");
    }

    const db = getDb(context);
    const existing = await db
      .prepare("SELECT id FROM projects WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return notFound("Project not found");
    }

    const name = body.name ?? null;
    const summary = body.summary ?? null;
    const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : null;
    const href = body.href ?? null;
    const status = body.status ?? null;

    await db
      .prepare(
        "UPDATE projects SET name = COALESCE(?, name), summary = COALESCE(?, summary), tags = COALESCE(?, tags), href = COALESCE(?, href), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(name, summary, tags, href, status, id)
      .run();

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to update project");
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing project id");
    }

    const db = getDb(context);
    const result = await db
      .prepare("DELETE FROM projects WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return notFound("Project not found");
    }

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to delete project");
  }
};
