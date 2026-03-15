import { useState } from "react";
import { Link } from "@remix-run/react";
import { PLANS, type PlanType } from "~/lib/plans";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";

export function PricingTable() {
  const [annual, setAnnual] = useState(false);

  function getPrice(planType: PlanType): string {
    const plan = PLANS[planType];
    if (!plan.price) return "$0";
    if (annual && plan.price.annual) {
      return `$${Math.round(plan.price.annual / 12)}`;
    }
    return `$${plan.price.monthly}`;
  }

  function getBillingLabel(planType: PlanType): string {
    const plan = PLANS[planType];
    if (!plan.price) return "forever";
    if (planType === "team") return "/seat/mo";
    return annual ? "/mo (billed annually)" : "/mo";
  }

  const tiers: {
    type: PlanType;
    highlighted: boolean;
    cta: string;
    ctaVariant: "primary" | "outline";
  }[] = [
    { type: "free", highlighted: false, cta: "Get Started", ctaVariant: "outline" },
    { type: "pro", highlighted: true, cta: "Start Pro Trial", ctaVariant: "primary" },
    { type: "team", highlighted: false, cta: "Contact Sales", ctaVariant: "outline" },
  ];

  return (
    <section className="bg-guard-950 py-20 sm:py-28" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-guard-400">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        {/* Monthly / Annual toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
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
              annual ? "bg-catalyst-600" : "bg-guard-700"
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
            <Badge variant="success" className="ml-2 bg-catalyst-600/20 text-catalyst-400 border-catalyst-600/30">
              Save 31%
            </Badge>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map(({ type, highlighted, cta, ctaVariant }) => {
            const plan = PLANS[type];
            return (
              <div
                key={type}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  highlighted
                    ? "glass ring-2 ring-catalyst-600/50 scale-[1.02]"
                    : "glass"
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="brand" className="bg-catalyst-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {getPrice(type)}
                  </span>
                  <span className={`text-sm ${type === "team" ? "text-knowledge-500" : "text-guard-400"}`}>
                    {getBillingLabel(type)}
                  </span>
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-guard-300"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-catalyst-400"
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

                <div className="mt-8">
                  <Link to={type === "team" ? "/contact" : "/sign-up"}>
                    <Button
                      variant={ctaVariant}
                      className={`w-full rounded-xl ${
                        ctaVariant === "primary"
                          ? "bg-catalyst-600 text-white hover:bg-catalyst-500 shield-glow"
                          : "border-guard-600 text-guard-300 hover:border-catalyst-600 hover:text-catalyst-400"
                      }`}
                    >
                      {cta}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
