/**
 * Author: netnr
 * Date: 2022-10
 *
 * deno run --allow-net --allow-read --watch deno.ts
 */

import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import { lookup } from "https://deno.land/x/media_types@v2.13.0/mod.ts";

serve(handler, { port: 713 });

async function handler(req: Request): Promise<Response> {
  let filePath = "." + new URL(req.url).pathname;
  if (filePath.endsWith("/")) {
    filePath += "index.html";
  }

  let fileSize;

  try {
    fileSize = (await Deno.stat(filePath)).size;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      try {
        filePath = "./404.html";
        fileSize = (await Deno.stat(filePath)).size;
      } catch (err) {
        return new Response("404", { status: 404 });
      }
    } else {
      return new Response("500", { status: 500 });
    }
  }

  const body = await Deno.readFile(filePath);

  let contentType = lookup(filePath) || "application/octet-stream";
  // charset
  if (
    contentType.startsWith("text/") ||
    contentType.endsWith("/json") ||
    contentType.endsWith("/javascript") ||
    contentType.endsWith("/xml")
  ) {
    contentType = `${contentType}; charset=utf-8`;
  }

  return new Response(body, {
    headers: {
      "content-length": fileSize.toString(),
      "content-type": contentType,
      "access-control-allow-origin": "*",
    },
  });
}
