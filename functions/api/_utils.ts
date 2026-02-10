type JsonValue = Record<string, unknown> | unknown[];

type ApiContext = {
  request: Request;
  env: Record<string, unknown> & { DB?: D1Database; STORAGE?: R2Bucket };
  params?: Record<string, string>;
};

export const json = (data: JsonValue, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
};

export const badRequest = (message: string) =>
  json({ ok: false, error: message }, { status: 400 });

export const notFound = (message = "Not found") =>
  json({ ok: false, error: message }, { status: 404 });

export const serverError = (message: string) =>
  json({ ok: false, error: message }, { status: 500 });

export const getDb = (context: ApiContext) => {
  if (!context.env.DB) {
    throw new Error("Missing D1 binding: DB");
  }

  return context.env.DB;
};

export const getBucket = (context: ApiContext) => {
  if (!context.env.STORAGE) {
    throw new Error("Missing R2 binding: STORAGE");
  }

  return context.env.STORAGE;
};
