import { badRequest, getDb, json, serverError } from "../_utils";

type ProjectInput = {
  name: string;
  summary: string;
  tags?: string[];
  href?: string | null;
  status?: "draft" | "published";
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare(
        "SELECT id, name, summary, tags, href, status, created_at, updated_at FROM projects ORDER BY updated_at DESC"
      )
      .all();

    return json({ ok: true, data: results ?? [] });
  } catch (error) {
    return serverError("Failed to fetch projects");
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as ProjectInput;

    if (!body?.name || !body?.summary) {
      return badRequest("Project name and summary are required");
    }

    const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : "[]";
    const href = body.href ?? null;
    const status = body.status ?? "draft";

    const db = getDb(context);
    const result = await db
      .prepare(
        "INSERT INTO projects (name, summary, tags, href, status) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(body.name, body.summary, tags, href, status)
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (error) {
    return serverError("Failed to create project");
  }
};
