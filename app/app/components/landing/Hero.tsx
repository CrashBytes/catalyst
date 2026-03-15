import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-guard-950 pb-20 pt-24 sm:pb-28 sm:pt-32">
      {/* Subtle grid background */}
      <div className="bg-grid-pattern bg-grid absolute inset-0 opacity-[0.03]" />

      {/* Decorative guardrail lines */}
      <div className="pointer-events-none absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-catalyst-600/20 to-transparent sm:left-16" />
      <div className="pointer-events-none absolute inset-y-0 right-8 w-px bg-gradient-to-b from-transparent via-catalyst-600/20 to-transparent sm:right-16" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Shield icon */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-catalyst-600/10 ring-1 ring-catalyst-600/20">
            <svg
              className="h-8 w-8 text-catalyst-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="gradient-text">Analyze</span> any codebase.{" "}
            <span className="gradient-text">Perfect configs</span> in seconds.
          </h1>
          <p className="mt-6 text-lg leading-8 text-guard-400">
            Catalyst scans your project and generates optimized CLAUDE.md files,
            custom skills, agent configs, MCP server setups, and guardrails
            — so Claude Code understands your codebase from the start.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/sign-up">
              <Button
                size="lg"
                className="bg-catalyst-600 px-8 py-3 text-white rounded-xl hover:bg-catalyst-500 hover:shield-glow transition-all"
              >
                Get Started Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border border-guard-600 text-guard-300 rounded-xl px-8 py-3 hover:border-catalyst-600 hover:text-catalyst-400 transition-all"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Terminal-style code preview */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="overflow-hidden rounded-xl border border-guard-700 bg-guard-900 shadow-2xl shield-glow">
            <div className="flex items-center gap-2 border-b border-guard-700 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-catalyst-500/80" />
              <span className="ml-2 text-sm text-guard-400">terminal</span>
            </div>
            <pre className="p-6 text-sm leading-relaxed text-catalyst-400">
              <code>{`$ npx catalyst analyze ./my-project

  Scanning project structure...
  Detecting frameworks: React, TypeScript, Tailwind
  Analyzing 142 files across 23 directories

  Generated:
    CLAUDE.md          — project context & conventions
    skills/deploy.md   — deployment workflow skill
    agents/reviewer.md — code review agent config
    .mcp.json          — MCP server configuration

  All configs saved to .claude/`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
