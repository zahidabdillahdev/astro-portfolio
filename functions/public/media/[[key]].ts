import { getBucket } from "../../api/_utils";

export const onRequestGet: PagesFunction = async (context) => {
  const key = context.params?.key;
  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = getBucket(context);
  const object = await bucket.get(key);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=3600");

  return new Response(object.body, { headers });
};
