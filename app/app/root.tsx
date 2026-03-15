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
  return rootAuthLoader(args, ({ request }) => {
    const env = (args.context as any).cloudflare?.env || {};
    return {
      ENV: {
        CLERK_PUBLISHABLE_KEY: env.CLERK_PUBLISHABLE_KEY || "",
      },
    };
  });
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
      <body className="h-full bg-guard-950 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-guard-400 mb-4">Please try again or contact support.</p>
          <a href="/" className="text-catalyst-400 hover:text-catalyst-300">
            Back to home
          </a>
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
