// Tiny client components for server pages.
"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui";

export function SignOutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
      🚪 Log out
    </Button>
  );
}
