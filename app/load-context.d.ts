import type { AppLoadContext } from "@remix-run/cloudflare";

type Cloudflare = {
  env: Env;
  cf: IncomingRequestCfProperties;
  ctx: {
    waitUntil: (promise: Promise<unknown>) => void;
    passThroughOnException: () => void;
  };
  caches: CacheStorage;
};

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}
