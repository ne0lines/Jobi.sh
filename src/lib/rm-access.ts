type RmAccessSubject = {
  rmOrganizationId?: string | null;
  role?: string | null;
};

export function hasRmAccess(subject: RmAccessSubject | null | undefined): boolean {
  if (!subject?.rmOrganizationId) {
    return false;
  }

  return subject.role === "admin" || subject.role === "rm";
}