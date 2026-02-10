import { badRequest, getDb, json, notFound, serverError } from "../_utils";

type CertificationInput = {
  name?: string;
  year?: string;
  issued_by?: string;
  credential_id?: string | null;
  verify_link?: string | null;
  file_key?: string | null;
  status?: "draft" | "published";
};

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing certification id");
    }

    const body = (await context.request.json()) as CertificationInput;
    if (!body || Object.keys(body).length === 0) {
      return badRequest("Payload is required");
    }

    const db = getDb(context);
    const existing = await db
      .prepare("SELECT id FROM certifications WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return notFound("Certification not found");
    }

    const name = body.name ?? null;
    const year = body.year ?? null;
    const issuedBy = body.issued_by ?? null;
    const credentialId = body.credential_id ?? null;
    const verifyLink = body.verify_link ?? null;
    const fileKey = body.file_key ?? null;
    const status = body.status ?? null;

    await db
      .prepare(
        "UPDATE certifications SET name = COALESCE(?, name), year = COALESCE(?, year), issued_by = COALESCE(?, issued_by), credential_id = COALESCE(?, credential_id), verify_link = COALESCE(?, verify_link), file_key = COALESCE(?, file_key), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(name, year, issuedBy, credentialId, verifyLink, fileKey, status, id)
      .run();

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to update certification");
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return badRequest("Missing certification id");
    }

    const db = getDb(context);
    const result = await db
      .prepare("DELETE FROM certifications WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return notFound("Certification not found");
    }

    return json({ ok: true });
  } catch (error) {
    return serverError("Failed to delete certification");
  }
};
