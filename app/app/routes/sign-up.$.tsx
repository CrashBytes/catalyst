import { SignUp } from "@clerk/remix";
import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up - Catalyst" },
    { name: "description", content: "Create your Catalyst account and start analyzing your codebase." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-guard-950">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
