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
    const env = (args.context.cloudflare as any).env as Env;
    return rootAuthLoader(args, ({ request }) => {
      return {
        ENV: {
          CLERK_PUBLISHABLE_KEY: env.CLERK_PUBLISHABLE_KEY,
        },
      };
    });
  } catch (error) {
    console.error("Root loader error:", error);
    throw error;
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
              ? `${error.status}: ${error.data}`
              : error instanceof Error
                ? error.message + "\n\n" + error.stack
                : "Unknown error"}
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
