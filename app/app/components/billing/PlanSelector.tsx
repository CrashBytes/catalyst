import { useState } from "react";
import { PLANS, type PlanType } from "~/lib/plans";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";

export interface PlanSelectorProps {
  currentPlan: PlanType;
  onSelect: (plan: PlanType, annual: boolean) => void;
  loading?: boolean;
}

export function PlanSelector({
  currentPlan,
  onSelect,
  loading = false,
}: PlanSelectorProps) {
  const [annual, setAnnual] = useState(false);

  const planTypes: PlanType[] = ["free", "pro", "team"];

  function getPrice(type: PlanType): string {
    const plan = PLANS[type];
    if (!plan.price) return "$0";
    if (annual && plan.price.annual) {
      return `$${Math.round(plan.price.annual / 12)}`;
    }
    return `$${plan.price.monthly}`;
  }

  function getAction(type: PlanType): string | null {
    if (type === currentPlan) return null;
    const order: PlanType[] = ["free", "pro", "team"];
    const currentIndex = order.indexOf(currentPlan);
    const targetIndex = order.indexOf(type);
    return targetIndex > currentIndex ? "Upgrade" : "Downgrade";
  }

  return (
    <div>
      {/* Toggle */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${!annual ? "text-white" : "text-guard-500"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            annual ? "bg-catalyst-600" : "bg-guard-800"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
              annual ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${annual ? "text-white" : "text-guard-500"}`}
        >
          Annual
        </span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {planTypes.map((type) => {
          const plan = PLANS[type];
          const isCurrent = type === currentPlan;
          const action = getAction(type);
          const isFeatured = type === "pro";

          return (
            <div
              key={type}
              className={`relative rounded-xl p-6 ${
                isCurrent
                  ? "ring-2 ring-catalyst-600 glass"
                  : "glass hover:border-guard-600"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-4">
                  <Badge variant="brand">Current Plan</Badge>
                </div>
              )}

              <h3 className="text-lg font-semibold text-white">
                {plan.name}
              </h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${isFeatured ? "gradient-text" : "text-white"}`}>
                  {getPrice(type)}
                </span>
                <span className="text-sm text-guard-500">
                  {plan.price ? "/mo" : ""}
                </span>
              </div>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-guard-300"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-catalyst-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {action ? (
                  <Button
                    variant={action === "Upgrade" ? "primary" : "outline"}
                    className={`w-full ${action === "Upgrade" ? "bg-catalyst-600 hover:bg-catalyst-500 text-white" : ""}`}
                    onClick={() => onSelect(type, annual)}
                    loading={loading}
                  >
                    {action} to {plan.name}
                  </Button>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
