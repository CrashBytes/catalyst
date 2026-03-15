import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as cloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  plugins: [
    cloudflareDevProxy(),
    remix(),
  ],
});
