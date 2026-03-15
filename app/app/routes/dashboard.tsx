import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import { getUserById, createUser } from "~/services/user.server";
import { UserButton } from "@clerk/remix";

export async function loader(args: LoaderFunctionArgs) {
  const { userId, sessionClaims } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  const db = getDb(args.context);
  let user = await getUserById(db, userId);

  if (!user) {
    // Clerk session claims structure varies - try multiple paths
    const claims = sessionClaims as Record<string, any> || {};
    const email =
      claims.email ||
      claims.primaryEmail ||
      claims.email_address ||
      claims.primary_email_address ||
      (claims.emails && claims.emails[0]) ||
      `${userId}@catalyst.local`;
    const name =
      claims.name ||
      claims.fullName ||
      claims.full_name ||
      (claims.firstName || claims.first_name
        ? `${claims.firstName || claims.first_name} ${claims.lastName || claims.last_name || ""}`.trim()
        : null);
    const avatarUrl =
      claims.imageUrl || claims.image_url || claims.avatar_url || null;

    try {
      await createUser(db, {
        id: userId,
        email: String(email),
        name: name ? String(name) : undefined,
        avatar_url: avatarUrl ? String(avatarUrl) : undefined,
      });
    } catch (e) {
      console.error("Failed to create user:", e);
    }

    user = await getUserById(db, userId);
  }

  return json({ user });
}

const navItems = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/projects", label: "Projects", end: false },
  { to: "/dashboard/billing", label: "Billing", end: false },
  { to: "/dashboard/team", label: "Team", end: false },
  { to: "/dashboard/settings", label: "Settings", end: false },
];

export default function DashboardLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen bg-guard-950">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-guard-700/50 lg:bg-guard-900">
        <div className="flex h-16 items-center px-6 border-b border-guard-700/50">
          <Link to="/" className="text-xl font-bold text-catalyst-400">
            Catalyst
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-catalyst-600/20 text-catalyst-400"
                    : "text-guard-400 hover:bg-guard-800/60"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-guard-700/50 p-4">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-guard-100">
                {user?.name || user?.email}
              </p>
              <p className="truncate text-xs text-guard-500 capitalize">
                {user?.plan || "free"} plan
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b border-guard-700/50 bg-guard-900 px-4 lg:hidden">
          <Link to="/" className="text-xl font-bold text-catalyst-400">
            Catalyst
          </Link>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-guard-700/50 bg-guard-900 px-4 lg:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${
                  isActive
                    ? "border-catalyst-500 text-catalyst-400"
                    : "border-transparent text-guard-500 hover:border-guard-600 hover:text-guard-300"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-6">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
