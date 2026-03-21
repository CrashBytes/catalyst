import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form, Link, useNavigation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import { getUserById, getUserByEmail } from "~/services/user.server";
import {
  getUserOrganizations,
  getOrganizationMembers,
  getMemberCount,
  createOrganization,
  addOrganizationMember,
  removeOrganizationMember,
} from "~/services/organization.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Team - Catalyst" },
    { name: "description", content: "Manage your Catalyst team and organization." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const user = await getUserById(db, userId);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const orgs = await getUserOrganizations(db, userId);
  const org = orgs.length > 0 ? orgs[0] : null;

  let members: Awaited<ReturnType<typeof getOrganizationMembers>> = [];
  let seatCount = 0;

  if (org) {
    members = await getOrganizationMembers(db, org.id);
    seatCount = await getMemberCount(db, org.id);
  }

  return json({
    user: { id: user.id, plan: user.plan },
    organization: org,
    members,
    seatCount,
    maxSeats: org?.max_seats || 0,
  });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const formData = await args.request.formData();
  const intent = formData.get("intent") as string;

  const user = await getUserById(db, userId);
  if (!user) {
    return json({ error: "User not found." }, { status: 404 });
  }

  if (intent === "create-org") {
    if (user.plan !== "team") {
      return json(
        { error: "Upgrade to the Team plan to create an organization." },
        { status: 403 }
      );
    }

    const name = formData.get("orgName") as string;
    if (!name || name.trim().length === 0) {
      return json(
        { error: "Organization name is required." },
        { status: 400 }
      );
    }

    const orgId = crypto.randomUUID();
    await createOrganization(db, {
      id: orgId,
      name: name.trim(),
      ownerId: userId,
    });

    return json({ success: true });
  }

  if (intent === "invite") {
    const email = formData.get("email") as string;
    const role = (formData.get("role") as string) || "member";

    if (!email || email.trim().length === 0) {
      return json({ error: "Email is required." }, { status: 400 });
    }

    const orgs = await getUserOrganizations(db, userId);
    const org = orgs[0];
    if (!org) {
      return json({ error: "No organization found." }, { status: 404 });
    }

    // Check seat limit
    const currentCount = await getMemberCount(db, org.id);
    if (currentCount >= org.max_seats) {
      return json(
        {
          error: `You've reached the maximum of ${org.max_seats} seats. Contact support to add more.`,
        },
        { status: 403 }
      );
    }

    const invitedUser = await getUserByEmail(db, email.trim());
    if (!invitedUser) {
      return json(
        {
          error:
            "User not found. They must sign up for Catalyst before being invited.",
        },
        { status: 404 }
      );
    }

    await addOrganizationMember(db, org.id, invitedUser.id, role);
    return json({ success: true });
  }

  if (intent === "remove") {
    const memberId = formData.get("memberId") as string;
    if (!memberId) {
      return json({ error: "Member ID is required." }, { status: 400 });
    }

    const orgs = await getUserOrganizations(db, userId);
    const org = orgs[0];
    if (!org) {
      return json({ error: "No organization found." }, { status: 404 });
    }

    // Prevent removing self if owner
    if (memberId === userId && org.owner_id === userId) {
      return json(
        { error: "You cannot remove yourself as the organization owner." },
        { status: 400 }
      );
    }

    await removeOrganizationMember(db, org.id, memberId);
    return json({ success: true });
  }

  if (intent === "change-role") {
    const memberId = formData.get("memberId") as string;
    const newRole = formData.get("newRole") as string;

    if (!memberId || !newRole) {
      return json(
        { error: "Member ID and role are required." },
        { status: 400 }
      );
    }

    const orgs = await getUserOrganizations(db, userId);
    const org = orgs[0];
    if (!org) {
      return json({ error: "No organization found." }, { status: 404 });
    }

    await addOrganizationMember(db, org.id, memberId, newRole);
    return json({ success: true });
  }

  return json({ error: "Invalid action." }, { status: 400 });
}

export default function TeamPage() {
  const { user, organization, members, seatCount, maxSeats } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Not on team plan
  if (user.plan !== "team" && !organization) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <div className="mt-6 rounded-lg border border-dashed border-guard-700/50 bg-guard-900/50 p-8 text-center">
          <h2 className="text-lg font-semibold text-guard-100">
            Upgrade to Team
          </h2>
          <p className="mt-2 text-sm text-guard-400">
            The Team plan includes shared workspaces, role-based access, and
            centralized billing. $29/seat/month.
          </p>
          <Link
            to="/dashboard/billing"
            className="mt-4 inline-flex rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500"
          >
            Upgrade to Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="mt-1 text-sm text-guard-400">
          Manage your team members and organization.
        </p>
      </div>

      {actionData && "error" in actionData && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-4">
          <p className="text-sm text-red-400">{actionData.error}</p>
        </div>
      )}

      {actionData && "success" in actionData && (
        <div className="rounded-lg border border-green-800 bg-green-900/30 p-4">
          <p className="text-sm text-green-400">Action completed.</p>
        </div>
      )}

      {/* Create Organization */}
      {!organization && user.plan === "team" && (
        <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
          <h2 className="text-lg font-semibold text-guard-100">
            Create an Organization
          </h2>
          <p className="mt-1 text-sm text-guard-400">
            Set up your team workspace to start collaborating.
          </p>
          <Form method="post" className="mt-4 flex items-end gap-3">
            <input type="hidden" name="intent" value="create-org" />
            <div className="flex-1">
              <label
                htmlFor="orgName"
                className="block text-sm font-medium text-guard-300"
              >
                Organization Name
              </label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                required
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
                placeholder="My Team"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </Form>
        </div>
      )}

      {/* Organization Info */}
      {organization && (
        <>
          <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
            <h2 className="text-lg font-semibold text-guard-100">
              {organization.name}
            </h2>
            <p className="mt-1 text-sm text-guard-400">
              {seatCount} of {maxSeats} seats used
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-guard-800">
              <div
                className="h-full rounded-full bg-catalyst-600"
                style={{
                  width: `${
                    maxSeats > 0
                      ? Math.min((seatCount / maxSeats) * 100, 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Invite Member */}
          <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
            <h2 className="text-lg font-semibold text-guard-100">
              Invite Member
            </h2>
            <Form method="post" className="mt-4 flex items-end gap-3">
              <input type="hidden" name="intent" value="invite" />
              <div className="flex-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-guard-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
                  placeholder="teammate@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-guard-300"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500 disabled:opacity-50"
              >
                {isSubmitting ? "Inviting..." : "Invite"}
              </button>
            </Form>
          </div>

          {/* Members List */}
          <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
            <h2 className="text-lg font-semibold text-guard-100">Members</h2>
            <div className="mt-4 divide-y divide-guard-700/50">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-guard-100">
                      {member.name || member.email}
                    </p>
                    <p className="text-xs text-guard-500">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-guard-800/60 px-2.5 py-0.5 text-xs font-medium text-guard-400 capitalize">
                      {member.role}
                    </span>
                    {member.user_id !== organization.owner_id && (
                      <Form method="post">
                        <input type="hidden" name="intent" value="remove" />
                        <input
                          type="hidden"
                          name="memberId"
                          value={member.user_id}
                        />
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (
                              !confirm(
                                "Remove this member from the organization?"
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </Form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-6">
      <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
      <p className="mt-2 text-sm text-guard-400">
        {isRouteErrorResponse(error)
          ? `${error.status}: ${error.data}`
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
      </p>
      <a href="/dashboard" className="mt-4 inline-block text-sm text-catalyst-400 hover:text-catalyst-300">
        Back to dashboard
      </a>
    </div>
  );
}
