import { Card, CardBody, CardHeader } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";

export type MemberRole = "owner" | "admin" | "member";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatarUrl?: string;
}

export interface TeamSeatsProps {
  members: TeamMember[];
  maxSeats: number;
  onInvite?: () => void;
  onRemove?: (memberId: string) => void;
}

const roleBadgeVariant: Record<MemberRole, "brand" | "default" | "success"> = {
  owner: "brand",
  admin: "success",
  member: "default",
};

export function TeamSeats({
  members,
  maxSeats,
  onInvite,
  onRemove,
}: TeamSeatsProps) {
  const seatsUsed = members.length;
  const seatsAvailable = maxSeats - seatsUsed;

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Team Seats
            </h3>
            <p className="mt-1 text-sm text-guard-400">
              {seatsUsed} of {maxSeats} seats used
            </p>
          </div>
          {onInvite && seatsAvailable > 0 && (
            <Button size="sm" variant="outline" onClick={onInvite} className="border-catalyst-600 text-catalyst-400 hover:bg-catalyst-600/10">
              Invite Member
            </Button>
          )}
        </div>

        {/* Usage bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-guard-700">
          <div
            className={`h-full rounded-full transition-all ${
              seatsAvailable <= 1 ? "bg-knowledge-500" : "bg-catalyst-600"
            }`}
            style={{ width: `${(seatsUsed / maxSeats) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardBody className="p-0">
        <ul className="divide-y divide-guard-700/30">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-guard-700 text-sm font-medium text-guard-300">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-guard-100">
                    {member.name}
                  </p>
                  <p className="text-xs text-guard-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={roleBadgeVariant[member.role]}>
                  {member.role}
                </Badge>
                {onRemove && member.role !== "owner" && (
                  <button
                    onClick={() => onRemove(member.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    aria-label={`Remove ${member.name}`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                            stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {seatsAvailable === 0 && (
          <div className="border-t border-guard-700/30 px-6 py-3">
            <p className="text-sm text-knowledge-400">
              All seats are in use. Remove a member or upgrade to add more seats.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
