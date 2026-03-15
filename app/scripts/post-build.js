import { cpSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Copy server build into client output so Pages can access it
cpSync(join(root, "build/server"), join(root, "build/client/_server"), {
  recursive: true,
});

// Create functions handler for Cloudflare Pages
mkdirSync(join(root, "build/client/functions"), { recursive: true });
writeFileSync(
  join(root, "build/client/functions/[[path]].js"),
  `import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "../_server/index.js";

export const onRequest = createPagesFunctionHandler({ build });
`
);

console.log("Post-build: Copied server bundle and created Pages function handler.");
