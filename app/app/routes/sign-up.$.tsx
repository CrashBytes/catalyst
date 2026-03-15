import { SignUp } from "@clerk/remix";
import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [{ title: "Sign Up - Catalyst" }];
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-guard-950">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
