import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Spinner } from "@/components/ui";

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
