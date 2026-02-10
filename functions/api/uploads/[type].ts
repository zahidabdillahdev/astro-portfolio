import { badRequest, getBucket, json, serverError } from "../_utils";

const allowedTypes: Record<
  string,
  { contentTypes: string[]; maxSize: number }
> = {
  avatar: {
    contentTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 2 * 1024 * 1024,
  },
  photo: {
    contentTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024,
  },
  resume: {
    contentTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSize: 5 * 1024 * 1024,
  },
};

const sanitizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "-");

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const type = context.params?.type ?? "";
    const config = allowedTypes[type];
    if (!config) {
      return badRequest("Unsupported upload type");
    }

    const formData = await context.request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return badRequest("File is required");
    }

    if (!config.contentTypes.includes(file.type)) {
      return badRequest("Invalid file type");
    }

    if (file.size > config.maxSize) {
      return badRequest("File is too large");
    }

    const bucket = getBucket(context);
    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.name);
    const key = `${type}/${timestamp}-${safeName}`;

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    return json({ ok: true, key });
  } catch (error) {
    return serverError("Failed to upload file");
  }
};
