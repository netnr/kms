/**
 * Author: netnr
 * Date: 2023-02
 *
 * deno run --allow-net --allow-read --watch deno.ts
 */

 import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
 import { contentType } from "https://deno.land/std@0.177.0/media_types/mod.ts";
 
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
         filePath = "./index.html";
         fileSize = (await Deno.stat(filePath)).size;
       } catch (err) {
         return new Response("404", { status: 404 });
       }
     } else {
       return new Response("500", { status: 500 });
     }
   }
 
   const body = await Deno.readFile(filePath);
 
   let cType = contentType(filePath.split('.').pop()) || "application/octet-stream";
 
   return new Response(body, {
     headers: {
       "content-length": fileSize.toString(),
       "content-type": cType,
       "access-control-allow-origin": "*",
     },
   });
 }
 