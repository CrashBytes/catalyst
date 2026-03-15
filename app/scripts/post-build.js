import { cpSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const clientDir = join(root, "build/client");

// Clean previous artifacts
for (const f of ["_server"]) {
  const p = join(clientDir, f);
  if (existsSync(p)) rmSync(p, { recursive: true });
}

// Copy server bundle into the client output directory
cpSync(join(root, "build/server"), join(clientDir, "_server"), { recursive: true });

// Create functions directory in the client output (Pages looks here)
mkdirSync(join(clientDir, "functions"), { recursive: true });
writeFileSync(
  join(clientDir, "functions", "[[path]].js"),
  `import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "../_server/index.js";

export const onRequest = createPagesFunctionHandler({ build });
`
);

// Create _routes.json to route all non-static requests through functions
writeFileSync(
  join(clientDir, "_routes.json"),
  JSON.stringify({
    version: 1,
    include: ["/*"],
    exclude: ["/assets/*", "/favicon.ico"],
  }, null, 2)
);

console.log("Post-build: Created functions handler and copied server bundle.");
