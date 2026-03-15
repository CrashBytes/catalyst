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
  // Debug: inspect the context structure
  const ctx = args.context as any;
  const debugInfo = {
    contextKeys: Object.keys(ctx || {}),
    hasCloudflare: !!ctx?.cloudflare,
    cloudflareKeys: ctx?.cloudflare ? Object.keys(ctx.cloudflare) : [],
    cloudflareEnvKeys: ctx?.cloudflare?.env ? Object.keys(ctx.cloudflare.env) : [],
    directEnvKeys: ctx?.env ? Object.keys(ctx.env) : [],
    hasPK_cf: !!ctx?.cloudflare?.env?.CLERK_PUBLISHABLE_KEY,
    hasSK_cf: !!ctx?.cloudflare?.env?.CLERK_SECRET_KEY,
    hasPK_direct: !!ctx?.env?.CLERK_PUBLISHABLE_KEY,
    hasSK_direct: !!ctx?.env?.CLERK_SECRET_KEY,
  };

  // Return debug as a page for now
  if (new URL(args.request.url).searchParams.get("debug") === "1") {
    return json({ debug: debugInfo });
  }

  try {
    return await rootAuthLoader(args, ({ request }) => {
      const env = ctx?.cloudflare?.env || ctx?.env || {};
      return {
        ENV: {
          CLERK_PUBLISHABLE_KEY: env.CLERK_PUBLISHABLE_KEY || "",
        },
      };
    });
  } catch (error: any) {
    // Return the error as visible data instead of throwing
    return json({
      _error: true,
      message: error?.message || String(error),
      stack: error?.stack || "no stack",
      debug: debugInfo,
    });
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
              ? `${error.status}: ${typeof error.data === "string" ? error.data : JSON.stringify(error.data, null, 2)}`
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
  const data = useLoaderData<any>();

  // If we caught an error in the loader, display it
  if (data?._error) {
    return (
      <html lang="en" className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Debug - Catalyst</title>
          <Links />
        </head>
        <body className="h-full bg-gray-950 text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Loader Error (caught)</h1>
          <pre className="bg-gray-900 p-4 rounded text-red-400 text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          <Scripts />
        </body>
      </html>
    );
  }

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
