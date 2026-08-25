import { describe, expect, it } from "vitest";
import { hasMinRole, canManageStaff, canManageBilling } from "@/lib/auth/roles";

describe("staff roles", () => {
  it("ranks owner above admin and staff", () => {
    expect(hasMinRole("owner", "admin")).toBe(true);
    expect(hasMinRole("staff", "admin")).toBe(false);
    expect(canManageStaff("owner")).toBe(true);
    expect(canManageStaff("admin")).toBe(false);
    expect(canManageBilling("admin")).toBe(true);
  });
});
