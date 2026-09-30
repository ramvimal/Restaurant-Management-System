import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Spinner } from "@/components/ui";

export default function SignupPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
