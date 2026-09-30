import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/learn",
    "/lesson/:path*",
    "/practice",
    "/placement/:path*",
    "/leaderboard",
    "/profile",
    "/settings",
    "/languages",
    "/onboarding",
  ],
};
