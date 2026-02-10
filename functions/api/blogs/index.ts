import { badRequest, getDb, json, serverError } from "../_utils";

type BlogInput = {
  title: string;
  summary: string;
  slug: string;
  status?: "draft" | "published";
  content?: string | null;
  reading_time?: number | null;
  date?: string | null;
  author?: string | null;
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare(
        "SELECT id, title, summary, slug, status, content, reading_time, date, author, created_at, updated_at FROM blogs ORDER BY updated_at DESC"
      )
      .all();

    return json({ ok: true, data: results ?? [] });
  } catch (error) {
    return serverError("Failed to fetch blog posts");
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as BlogInput;

    if (!body?.title || !body?.summary || !body?.slug) {
      return badRequest("Title, summary, and slug are required");
    }

    const status = body.status ?? "draft";
    const content = body.content ?? null;
    const readingTime =
      typeof body.reading_time === "number" ? body.reading_time : null;
    const date = body.date ?? null;
    const author = body.author ?? null;

    const db = getDb(context);
    const result = await db
      .prepare(
        "INSERT INTO blogs (title, summary, slug, status, content, reading_time, date, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        body.title,
        body.summary,
        body.slug,
        status,
        content,
        readingTime,
        date,
        author
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (error) {
    return serverError("Failed to create blog post");
  }
};
