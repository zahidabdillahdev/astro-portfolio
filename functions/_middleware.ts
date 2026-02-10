const isLocalhost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1";

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);

  const isProtectedRoute =
    url.pathname.startsWith("/api") || url.pathname.startsWith("/admin");

  if (!isProtectedRoute) {
    return next();
  }

  if (isLocalhost(url.hostname)) {
    return next();
  }

  const accessJwt = request.headers.get("cf-access-jwt-assertion");
  const cookie = request.headers.get("cookie");

  if (!accessJwt && !cookie) {
    return new Response("Unauthorized", { status: 401 });
  }

  const identityResponse = await fetch(
    `${url.origin}/cdn-cgi/access/get-identity`,
    {
      headers: {
        ...(accessJwt ? { "cf-access-jwt-assertion": accessJwt } : {}),
        ...(cookie ? { cookie } : {}),
      },
    }
  );

  if (!identityResponse.ok) {
    return new Response("Unauthorized", { status: 401 });
  }

  return next();
};
