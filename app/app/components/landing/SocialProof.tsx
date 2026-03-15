const stats = [
  { label: "Developers", value: "2,500+" },
  { label: "Analyses Run", value: "18,000+" },
  { label: "Configs Generated", value: "45,000+" },
  { label: "Hours Saved", value: "12,000+" },
];

export function SocialProof() {
  return (
    <section className="bg-guard-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-guard-500">
          Trusted by developers building with Claude Code
        </p>

        <div className="glass mx-auto mt-10 max-w-4xl rounded-xl">
          <div className="grid grid-cols-2 gap-8 p-8 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${
                  index < stats.length - 1
                    ? "sm:border-r sm:border-guard-700/50"
                    : ""
                }`}
              >
                <p className="gradient-text text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-guard-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
