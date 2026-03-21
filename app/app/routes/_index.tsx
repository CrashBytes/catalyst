import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Hero } from "~/components/landing/Hero";
import { Features } from "~/components/landing/Features";
import { PricingTable } from "~/components/landing/PricingTable";
import { SocialProof } from "~/components/landing/SocialProof";
import { CTA } from "~/components/landing/CTA";

export const meta: MetaFunction = () => {
  return [
    { title: "Catalyst - AI-Powered Codebase Analysis for Claude Code" },
    {
      name: "description",
      content:
        "AI-powered codebase analysis for Claude Code. Generate optimized CLAUDE.md files, skills, agents, MCP configs, and guardrails.",
    },
    { property: "og:title", content: "Catalyst - AI-Powered Codebase Analysis for Claude Code" },
    { property: "og:description", content: "AI-powered codebase analysis for Claude Code. Generate optimized CLAUDE.md files, skills, agents, MCP configs, and guardrails." },
    { property: "og:url", content: "https://catalyst.crashbytes.com" },
    { property: "og:site_name", content: "Catalyst by CrashBytes" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Catalyst - AI-Powered Codebase Analysis for Claude Code" },
    { name: "twitter:description", content: "AI-powered codebase analysis for Claude Code. Generate optimized CLAUDE.md files, skills, agents, MCP configs, and guardrails." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-guard-950">
      {/* Navigation */}
      <nav className="border-b border-guard-700/50 bg-guard-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-catalyst-400">
                Catalyst
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <a
                  href="#features"
                  className="text-sm text-guard-300 hover:text-white"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-sm text-guard-300 hover:text-white"
                >
                  Pricing
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/sign-in"
                className="text-sm font-medium text-guard-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Sections */}
      <Hero />
      <Features />
      <div id="pricing">
        <PricingTable />
      </div>
      <SocialProof />
      <CTA />

      {/* Footer */}
      <footer className="border-t border-guard-700/50 bg-guard-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-guard-100">Product</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-guard-400 hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-sm text-guard-400 hover:text-white"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-guard-100">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="https://github.com/crashbytes/catalyst"
                    className="text-sm text-guard-400 hover:text-white"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.catalyst.dev"
                    className="text-sm text-guard-400 hover:text-white"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-guard-100">Company</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="https://crashbytes.dev"
                    className="text-sm text-guard-400 hover:text-white"
                  >
                    CrashBytes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-guard-100">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="/privacy"
                    className="text-sm text-guard-400 hover:text-white"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-sm text-guard-400 hover:text-white"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-guard-700/50 pt-8 text-center">
            <p className="text-sm text-guard-500">
              &copy; {new Date().getFullYear()} CrashBytes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
