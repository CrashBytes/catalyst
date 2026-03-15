export type PlanType = "free" | "pro" | "team";

export interface PlanDefinition {
  name: string;
  type: PlanType;
  price: { monthly: number; annual: number } | null;
  limits: {
    analysesPerMonth: number;
    configTypes: string[];
  };
  features: string[];
}

export const PLANS: Record<PlanType, PlanDefinition> = {
  free: {
    name: "Free",
    type: "free",
    price: null,
    limits: {
      analysesPerMonth: 5,
      configTypes: ["claudemd"],
    },
    features: [
      "5 analyses per month",
      "CLAUDE.md generation",
      "CLI access",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    type: "pro",
    price: { monthly: 12, annual: 99 },
    limits: {
      analysesPerMonth: -1, // unlimited
      configTypes: [
        "full",
        "claudemd",
        "skills",
        "agents",
        "mcp",
        "guardrails",
        "settings",
      ],
    },
    features: [
      "Unlimited analyses",
      "All config types",
      "Cloud history & sync",
      "Priority support",
      "API access",
    ],
  },
  team: {
    name: "Team",
    type: "team",
    price: { monthly: 29, annual: null! },
    limits: {
      analysesPerMonth: -1, // unlimited
      configTypes: [
        "full",
        "claudemd",
        "skills",
        "agents",
        "mcp",
        "guardrails",
        "settings",
      ],
    },
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Shared projects & analyses",
      "Role-based access",
      "Centralized billing",
      "SSO (coming soon)",
    ],
  },
};

export function getPlan(type: PlanType): PlanDefinition {
  return PLANS[type];
}

export function canRunAnalysis(
  plan: PlanType,
  analysisType: string,
  currentMonthCount: number
): { allowed: boolean; reason?: string } {
  const planDef = PLANS[plan];

  if (
    planDef.limits.analysesPerMonth !== -1 &&
    currentMonthCount >= planDef.limits.analysesPerMonth
  ) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${planDef.limits.analysesPerMonth} analyses this month. Upgrade to Pro for unlimited analyses.`,
    };
  }

  if (!planDef.limits.configTypes.includes(analysisType)) {
    return {
      allowed: false,
      reason: `The ${analysisType} config type requires a Pro or Team plan.`,
    };
  }

  return { allowed: true };
}
