import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

export function CTA() {
  return (
    <section className="relative bg-gradient-to-r from-catalyst-950 to-guard-900 py-20 sm:py-28">
      {/* Decorative rail lines */}
      <div className="pointer-events-none absolute inset-y-0 left-12 w-px bg-gradient-to-b from-transparent via-catalyst-600/30 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-12 w-px bg-gradient-to-b from-transparent via-catalyst-600/30 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to supercharge your Claude Code setup?
          </h2>
          <p className="mt-4 text-lg text-guard-300">
            Analyze your first project in under a minute. No credit card required.
          </p>
          <div className="mt-10">
            <Link to="/sign-up">
              <Button
                size="lg"
                className="bg-catalyst-600 px-8 py-3 text-white rounded-xl hover:bg-catalyst-500 hover:shield-glow transition-all"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
