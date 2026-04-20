type JobListOptions = {
  includeArchived?: boolean;
};

export const jobKeys = {
  root: ["jobs"] as const,
  all: (options: JobListOptions = {}) => ["jobs", "list", { includeArchived: Boolean(options.includeArchived) }] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
};

export const userKeys = {
  profile: ["user", "profile"] as const,
};
