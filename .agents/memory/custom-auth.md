---
name: Custom Auth System
description: DokumenProyek uses custom auth (Email OTP + WhatsApp OTP + Google OAuth) replacing Replit OIDC. Session format changed.
---

## Auth methods
- **Email OTP** via Brevo SMTP — `server/auth/emailOtp.ts` — requires SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_HOST=smtp-relay.brevo.com, SMTP_PORT=587
- **WhatsApp OTP** via Fonnte — `server/auth/fonnte.ts` — requires FONNTE_TOKEN
- **Google OAuth** via passport-google-oauth20 — `server/auth/googleAuth.ts` — requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (currently disabled)

## Session object shape
New-style (Google/Email/WA): `{ id, email, firstName, profileImageUrl, provider }`
Legacy OIDC: `{ claims: { sub }, expires_at, access_token, refresh_token }`

## isAuthenticated middleware
Updated in `server/replit_integrations/auth/replitAuth.ts` — checks `user.id` first (new-style), then falls back to `user.expires_at` (OIDC). Both paths return next().

## /api/auth/user endpoint
Updated in `server/replit_integrations/auth/routes.ts` — uses `req.user.id ?? req.user.claims?.sub` as userId.

## /api/auth/config endpoint (public)
Returns `{ google: bool, email: bool, whatsapp: bool }` — LoginPage fetches this to show/hide buttons dynamically.

## Login page
`client/src/pages/LoginPage.tsx` at `/login` route. Navbar buttons updated to `/login` (was `/api/login`).
`/api/login` now redirects to `/login` (custom page).

## User ID format
- Google: `google:<googleId>` (or merges with existing email match)
- Email OTP: `email:<email>` (or merges with existing email match)
- WhatsApp OTP: `phone:<normalised_e164>`

**Why:** Replit OIDC was tied to Replit platform login. Owner needed own auth for public users.
**How to apply:** Any new auth-related endpoints must check both `user.id` and `user.claims?.sub` for compatibility.
