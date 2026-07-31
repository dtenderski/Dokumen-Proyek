import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { authStorage } from "../replit_integrations/auth/storage";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";
import type { Express } from "express";

export function setupGoogleAuth(app: Express) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn("[Auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google login disabled.");
    return;
  }

  const baseUrl =
    process.env.APP_URL ||
    (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000");

  const callbackURL = `${baseUrl}/api/auth/google/callback`;
  console.log(`[Auth] Google OAuth callback URL: ${callbackURL}`);

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          // Try to find existing user by email first (unified account)
          let existingByEmail = null;
          if (email) {
            const [found] = await db.select().from(users).where(eq(users.email, email));
            existingByEmail = found;
          }

          const userId = existingByEmail?.id || `google:${profile.id}`;

          const user = await authStorage.upsertUser({
            id: userId,
            email: email ?? existingByEmail?.email ?? undefined,
            firstName: profile.name?.givenName ?? profile.displayName ?? existingByEmail?.firstName ?? undefined,
            lastName: profile.name?.familyName ?? existingByEmail?.lastName ?? undefined,
            profileImageUrl: profile.photos?.[0]?.value ?? existingByEmail?.profileImageUrl ?? undefined,
          });

          done(null, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            profileImageUrl: user.profileImageUrl,
            provider: "google",
          });
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );

  app.get(
    "/api/auth/google",
    (req, res, next) => {
      const returnTo = req.query.returnTo;
      if (typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
        (req.session as any).returnTo = returnTo;
      }
      next();
    },
    passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login?error=google_failed" }),
    (req, res) => {
      const returnTo = (req.session as any).returnTo || "/";
      delete (req.session as any).returnTo;
      res.redirect(returnTo);
    }
  );
}
