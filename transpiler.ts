import { transpile } from "https://deno.land/x/emit@0.29.0/mod.ts";
import { MiddlewareHandler } from "https://deno.land/x/hono@v3.9.0/mod.ts";

// Cache that maps from code itself to transpiled code (since this is to be
// used in development only, no need to cap the cache size)
const cache = new Map<string, string>();

// Typescript middleware
export const transpiler = (): MiddlewareHandler => {
  return async (c, next) => {
    // Transpiling needs to go at the end
    await next();

    // If the pathname is like "*.ts" we will transpile
    const url = new URL(c.req.url);
    if (!url.pathname.endsWith(".ts") && !url.pathname.endsWith(".tsx")) return;

    // Transpile the code and return the right content type
    // Code below is based on the pretty JSON middleware from Hono
    // See https://github.com/honojs/hono/tree/main/src/middleware/pretty-json
    const headers = { "content-type": "text/javascript; charset=utf-8" };
    const ts = await c.res.text();

    // If it is in the cache, use that, otherwise transpile and put in the cache
    if (cache.has(ts)) {
      c.res = new Response(cache.get(ts), { headers });
    } else {
      // Declare a random name for the specifier
      try {
        const root = "file:///" + crypto.randomUUID() + ".ts";
        const result = await transpile(root, {
          load(specifier: string) {
            const content = specifier === root ? ts : "";
            return Promise.resolve({ kind: "module", specifier, content });
          },
        });
        c.res = new Response(result.get(root), { headers });
      } catch (ex) {
        console.warn("Error transpiling " + url.pathname + ": " + ex.message);

        // Send original response (with the right JS content type, things will break in the browser)
        c.res = new Response(ts, { status: 500, headers });
      }
    }
  };
};
