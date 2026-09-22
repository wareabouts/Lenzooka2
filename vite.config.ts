import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import Busboy from "busboy";
import { lensSchema } from "./src/schema";
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/Lenzooka2/" : "/",
  plugins: [
    react(),
    {
      name: "bench-persistence",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const send = (code: number, value: unknown) => {
            res.statusCode = code;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(value));
          };
          if (
            req.url?.split("?")[0] === "/data/lens.json" &&
            req.method === "GET"
          ) {
            res.setHeader("Content-Type", "application/json");
            try {
              res.end(await fs.readFile("data/lens.json"));
            } catch {
              send(404, {
                error: "Restore data/lens.json from your backup, then reload.",
              });
            }
            return;
          }
          if (req.url === "/api/save" && req.method === "POST") {
            try {
              let body = "";
              for await (const chunk of req) {
                body += chunk;
                if (body.length > 10e6)
                  throw Error(
                    "Data exceeds 10 MB. Export a backup and reduce the file size.",
                  );
              }
              const data = lensSchema.parse(JSON.parse(body));
              for (const [key, val] of Object.entries(data))
                if (Array.isArray(val))
                  (data as any)[key] = val.sort((a: any, b: any) =>
                    a.id.localeCompare(b.id),
                  );
              await fs.writeFile(
                "data/lens.json.tmp",
                JSON.stringify(data, null, 2) + "\n",
              );
              await fs.rename("data/lens.json.tmp", "data/lens.json");
              send(200, { saved: true });
            } catch (e) {
              send(400, { error: String(e) });
            }
            return;
          }
          if (req.url === "/api/photo" && req.method === "POST") {
            try {
              const bb = Busboy({
                headers: req.headers,
                limits: { fileSize: 30e6, files: 1 },
              });
              let result: Promise<unknown> | undefined;
              bb.on("file", (_name, file, info) => {
                result = (async () => {
                  const chunks: Buffer[] = [];
                  for await (const c of file) chunks.push(c);
                  if (file.truncated)
                    throw Error("Photo exceeds 30 MB. Choose a smaller JPEG.");
                  const b = Buffer.concat(chunks);
                  if (b[0] !== 255 || b[1] !== 216)
                    throw Error("Choose a JPEG photo.");
                  const match = info.filename.match(/_(\d{6})/);
                  const stem =
                    match?.[1] ||
                    info.filename.match(/^(\d{6})/)?.[1] ||
                    String(Date.now()).slice(-6);
                  let id = stem;
                  for (let i = 1; ; i++) {
                    try {
                      await fs.access(path.join("public/photos", id + ".jpg"));
                      id = stem + "-" + i;
                    } catch {
                      break;
                    }
                  }
                  await fs.writeFile(
                    path.join("public/photos", id + ".jpg"),
                    b,
                  );
                  return { id, file: `photos/${id}.jpg` };
                })();
              });
              bb.on("close", async () => {
                try {
                  if (!result) {
                    send(400, {
                      error: "No photo received. Choose a JPEG and retry.",
                    });
                    return;
                  }
                  send(200, await result);
                } catch (e) {
                  send(400, { error: String(e) });
                }
              });
              bb.on("error", (e) => send(400, { error: String(e) }));
              req.pipe(bb);
            } catch (e) {
              send(400, { error: String(e) });
            }
            return;
          }
          next();
        });
      },
      async closeBundle() {
        await fs.mkdir("dist/data", { recursive: true });
        await fs.copyFile("data/lens.json", "dist/data/lens.json");
      },
    },
  ],
});
