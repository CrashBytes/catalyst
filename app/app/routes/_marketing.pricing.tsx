import type { MetaFunction } from "@remix-run/cloudflare";
import { PricingTable } from "~/components/landing/PricingTable";

export const meta: MetaFunction = () => {
  return [
    { title: "Pricing - Catalyst" },
    {
      name: "description",
      content: "Simple, transparent pricing for Catalyst codebase analysis. Start free, upgrade when you need more power.",
    },
    { property: "og:title", content: "Pricing - Catalyst" },
    { property: "og:description", content: "Simple, transparent pricing for Catalyst codebase analysis. Start free, upgrade when you need more power." },
    { property: "og:url", content: "https://catalyst.crashbytes.com/pricing" },
    { property: "og:site_name", content: "Catalyst by CrashBytes" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Pricing - Catalyst" },
    { name: "twitter:description", content: "Simple, transparent pricing for Catalyst codebase analysis. Start free, upgrade when you need more power." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

const faqs = [
  {
    question: "What counts as an analysis?",
    answer:
      "Each time you run the Catalyst CLI or trigger an analysis via the dashboard, it counts as one analysis. Re-viewing past results does not count.",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes. Upgrades take effect immediately and you'll be charged a prorated amount. Downgrades take effect at the end of your current billing period.",
  },
  {
    question: "What config types are included in the free plan?",
    answer:
      "The free plan includes CLAUDE.md generation. Upgrade to Pro to unlock skills, agents, MCP configs, guardrails, and settings generation.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee on all paid plans. Contact support if you're not satisfied.",
  },
  {
    question: "How does team billing work?",
    answer:
      "Team plans are billed per seat at $29/month. The team owner manages billing and can add or remove members at any time.",
  },
  {
    question: "Is there an annual discount?",
    answer:
      "Yes! The Pro plan is available at $99/year, saving you over 30% compared to monthly billing.",
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Pricing Section */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-guard-400">
            Start free, upgrade when you need more power.
          </p>
        </div>
        <PricingTable />
      </div>

      {/* FAQ Section */}
      <div className="bg-guard-900/50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            Frequently asked questions
          </h2>
          <dl className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-base font-semibold text-guard-100">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base text-guard-400">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
