import { defineConfig, devices } from "@playwright/test";

const SYSTEM_CHROMIUM =
  "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4b2dx1-chromium-138.0.7204.100/bin/chromium";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://localhost:5000",
    headless: true,
    // Simulate a touch-screen phone so .tap() and pointer events work.
    hasTouch: true,
    // Use the NixOS system-provided Chromium so no extra libs are needed.
    launchOptions: {
      executablePath: "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
