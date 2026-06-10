import { SignIn } from "@clerk/remix";
import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign In - Catalyst" },
    { name: "description", content: "Sign in to your Catalyst account." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-guard-950">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
