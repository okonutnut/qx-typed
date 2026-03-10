type UserRole = "admin" | "faculty" | "student";

function isAdmin(): boolean {
  return globalThis.userRole === "admin";
}

function hasRole(...roles: UserRole[]): boolean {
  return roles.indexOf(globalThis.userRole) !== -1;
}

function formatRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Administrator",
    faculty: "Instructor",
    student: "Student",
  };
  return labels[role] ?? role;
}
