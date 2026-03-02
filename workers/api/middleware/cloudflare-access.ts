import type { Context } from "hono";

export const cfAccessMiddleware = async (c: Context, next: () => Promise<void>) => {
  const environment = c.env.ENVIRONMENT;
  
  // Only check for Cloudflare Access token in production
  if (environment === 'production') {
    const jwtToken = c.req.header('Cf-Access-Jwt-Assertion');
    
    if (!jwtToken) {
      return c.json({ error: 'Unauthorized: Missing Cf-Access-Jwt-Assertion header' }, 401);
    }
  }
  
  await next();
};