import { badRequest, getDb, json, notFound, serverError } from "../_utils";

type BlogInput = {
  title?: string;
  summary?: string;
  slug?: string;
  status?: "draft" | "published";
  content?: string | null;
  reading_time?: number | null;
  date?: string | null;
  author?: string | null;
};

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing blog id");
    }

    const body = (await context.request.json()) as BlogInput;

    if (!body || Object.keys(body).length === 0) {
      return badRequest("Payload is required");
    }

    const db = getDb(context);
    const existing = await db
      .prepare("SELECT id FROM blogs WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return notFound("Blog post not found");
    }

    const title = body.title ?? null;
    const summary = body.summary ?? null;
    const slug = body.slug ?? null;
    const status = body.status ?? null;
    const content = body.content ?? null;
    const readingTime =
      typeof body.reading_time === "number" ? body.reading_time : null;
    const date = body.date ?? null;
    const author = body.author ?? null;

    await db
      .prepare(
        "UPDATE blogs SET title = COALESCE(?, title), summary = COALESCE(?, summary), slug = COALESCE(?, slug), status = COALESCE(?, status), content = COALESCE(?, content), reading_time = COALESCE(?, reading_time), date = COALESCE(?, date), author = COALESCE(?, author), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(title, summary, slug, status, content, readingTime, date, author, id)
      .run();

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to update blog post");
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing blog id");
    }

    const db = getDb(context);
    const result = await db
      .prepare("DELETE FROM blogs WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return notFound("Blog post not found");
    }

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to delete blog post");
  }
};
