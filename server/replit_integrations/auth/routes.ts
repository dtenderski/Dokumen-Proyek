import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  // Supports both new-style (Google/Email OTP) and legacy OIDC sessions
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      // New-style sessions store id directly; OIDC sessions use claims.sub
      const userId = req.user.id ?? req.user.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
