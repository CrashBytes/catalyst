import { SignIn } from "@clerk/remix";
import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [{ title: "Sign In - Catalyst" }];
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-guard-950">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
