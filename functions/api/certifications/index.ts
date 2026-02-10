import { badRequest, getDb, json, serverError } from "../_utils";

type CertificationInput = {
  name: string;
  year: string;
  issued_by: string;
  credential_id?: string | null;
  verify_link?: string | null;
  file_key?: string | null;
  status?: "draft" | "published";
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = getDb(context);
    const { results } = await db
      .prepare(
        "SELECT id, name, year, issued_by, credential_id, verify_link, file_key, status, created_at, updated_at FROM certifications ORDER BY updated_at DESC"
      )
      .all();

    return json({ ok: true, data: results ?? [] });
  } catch (error) {
    return serverError("Failed to fetch certifications");
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as CertificationInput;

    if (!body?.name || !body?.year || !body?.issued_by) {
      return badRequest("Name, year, and issuer are required");
    }

    const db = getDb(context);
    const result = await db
      .prepare(
        "INSERT INTO certifications (name, year, issued_by, credential_id, verify_link, file_key, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        body.name,
        body.year,
        body.issued_by,
        body.credential_id ?? null,
        body.verify_link ?? null,
        body.file_key ?? null,
        body.status ?? "draft"
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (error) {
    return serverError("Failed to create certification");
  }
};
