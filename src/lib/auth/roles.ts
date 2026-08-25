export type StaffRole = "owner" | "admin" | "staff";

export const ROLE_RANK: Record<StaffRole, number> = {
  staff: 1,
  admin: 2,
  owner: 3,
};

export function hasMinRole(role: StaffRole, minimum: StaffRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function canManageStaff(role: StaffRole) {
  return role === "owner";
}

export function canManageBilling(role: StaffRole) {
  return hasMinRole(role, "admin");
}

export function canWriteOperations(role: StaffRole) {
  return hasMinRole(role, "staff");
}
