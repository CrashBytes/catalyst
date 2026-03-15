import { Card, CardBody } from "~/components/ui/Card";
import type { PlanType } from "~/lib/plans";
import { PLANS } from "~/lib/plans";

export interface UsageStatsProps {
  plan: PlanType;
  analysesThisMonth: number;
  projectsCount: number;
}

export function UsageStats({
  plan,
  analysesThisMonth,
  projectsCount,
}: UsageStatsProps) {
  const planDef = PLANS[plan];
  const limit = planDef.limits.analysesPerMonth;
  const isUnlimited = limit === -1;
  const nearLimit = !isUnlimited && analysesThisMonth >= limit * 0.8;
  const atLimit = !isUnlimited && analysesThisMonth >= limit;

  const stats = [
    {
      label: "Analyses This Month",
      value: isUnlimited
        ? String(analysesThisMonth)
        : `${analysesThisMonth} / ${limit}`,
      sublabel: isUnlimited ? "Unlimited" : undefined,
      warning: atLimit,
      showBar: !isUnlimited,
      barPercent: isUnlimited ? 0 : Math.min((analysesThisMonth / limit) * 100, 100),
      barWarning: nearLimit,
    },
    {
      label: "Projects",
      value: String(projectsCount),
    },
    {
      label: "Current Plan",
      value: planDef.name,
      sublabel: plan === "free" ? "Upgrade for more" : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="glass rounded-xl">
          <CardBody>
            <p className="text-sm text-guard-400">{stat.label}</p>
            <p
              className={`mt-1 text-2xl font-bold ${
                stat.warning ? "text-knowledge-500" : "text-white"
              }`}
            >
              {stat.value}
            </p>
            {stat.showBar && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-guard-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    stat.barWarning ? "bg-knowledge-500" : "bg-catalyst-600"
                  }`}
                  style={{ width: `${stat.barPercent}%` }}
                />
              </div>
            )}
            {stat.sublabel && (
              <p className="mt-0.5 text-xs text-guard-500">{stat.sublabel}</p>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
