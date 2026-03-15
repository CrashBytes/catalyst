import { cpSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = join(__dirname, "..");
const repoRoot = join(appRoot, "..");

// Create functions directory at REPO ROOT (where Cloudflare Pages looks for it)
const functionsDir = join(repoRoot, "functions");
if (existsSync(functionsDir)) rmSync(functionsDir, { recursive: true });
mkdirSync(functionsDir, { recursive: true });

// The function imports relative to repo root /functions/ -> ../app/build/server/
writeFileSync(
  join(functionsDir, "[[path]].js"),
  `import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "../app/build/server/index.js";

export const onRequest = createPagesFunctionHandler({ build });
`
);

// Create _routes.json in build output to route non-static requests
writeFileSync(
  join(appRoot, "build/client/_routes.json"),
  JSON.stringify({
    version: 1,
    include: ["/*"],
    exclude: ["/assets/*", "/favicon.ico"],
  }, null, 2)
);

console.log("Post-build: Created /functions/[[path]].js and _routes.json");
