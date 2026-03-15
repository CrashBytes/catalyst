import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp } from "@clerk/remix";
import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import stylesheet from "~/tailwind.css?url";

export const links = () => [{ rel: "stylesheet", href: stylesheet }];

export const loader = async (args: LoaderFunctionArgs) => {
  try {
    // Debug: log context structure to find where env vars live
    const ctx = args.context as any;
    const cloudflare = ctx.cloudflare || ctx;
    const env = cloudflare.env || ctx.env || {};

    const debugInfo = {
      hasContext: !!ctx,
      contextKeys: Object.keys(ctx || {}),
      hasCloudflare: !!ctx.cloudflare,
      cloudflareKeys: ctx.cloudflare ? Object.keys(ctx.cloudflare) : [],
      hasEnv: !!env,
      envKeys: Object.keys(env || {}),
      hasPK: !!env.CLERK_PUBLISHABLE_KEY,
      hasSK: !!env.CLERK_SECRET_KEY,
    };
    console.log("ROOT LOADER DEBUG:", JSON.stringify(debugInfo));

    return rootAuthLoader(args, ({ request }) => {
      return {
        ENV: {
          CLERK_PUBLISHABLE_KEY: env.CLERK_PUBLISHABLE_KEY || "",
        },
      };
    });
  } catch (error: any) {
    console.error("Root loader error:", error?.message || error);
    throw new Response(
      JSON.stringify({
        error: error?.message || String(error),
        stack: error?.stack,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Catalyst</title>
        <Links />
      </head>
      <body className="h-full bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <pre className="text-left bg-gray-900 p-4 rounded text-red-400 text-sm overflow-auto max-w-2xl">
            {isRouteErrorResponse(error)
              ? `${error.status}: ${typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)}`
              : error instanceof Error
                ? error.message + "\n\n" + error.stack
                : JSON.stringify(error, null, 2) || "Unknown error"}
          </pre>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default ClerkApp(App);
