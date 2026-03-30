# Data Routines

Rules and patterns for all data-related changes in this project. Follow these when adding, modifying, or removing anything that touches data fetching, mutations, API routes, or the database.

---

## Data Flow

```
Server Component
  └─ src/server/queries.ts        (Prisma, server-only, used for prefetch)

Client Component
  └─ src/lib/hooks/jobs.ts        (TanStack Query hooks)
       └─ src/app/services/services.ts   (fetch calls)
            └─ src/app/api/jobs/         (API route)
                 └─ src/lib/prisma.ts    (Prisma client)
```

**Rule:** Never call Prisma directly from a page or component. Server Components use `src/server/queries.ts`. Client Components use hooks from `src/lib/hooks/`.

---

## TanStack Query

### Existing hooks (`src/lib/hooks/jobs.ts`)

| Hook | Type | What it does | Cache key |
|---|---|---|---|
| `useJobs()` | Query | Fetches all jobs for the current user | `["jobs"]` |
| `useJob(id)` | Query | Fetches a single job by ID | `["jobs", id]` |
| `useCreateJob()` | Mutation | POSTs a new job, invalidates `["jobs"]` | — |
| `useUpdateJob()` | Mutation | PATCHes a job, invalidates `["jobs", id]` and `["jobs"]` | — |
| `useDeleteJob()` | Mutation | DELETEs a job, invalidates `["jobs"]` | — |

### When to use which

- **Read data in a client component** → use a `useQuery` hook
- **Write/modify data** → use a `useMutation` hook; handle `onSuccess`/`onError` at the call site with `toast`
- **Read data in a server component** → use a function from `src/server/queries.ts` directly

### Adding a new query hook

1. Add a service function in `src/app/services/services.ts`
2. Add a query key in `src/lib/hooks/job-query-keys.ts`
3. Add the hook in `src/lib/hooks/jobs.ts`

Example:
```typescript
// job-query-keys.ts
export const jobKeys = {
  all: ["jobs"] as const,
  detail: (id: string) => ["jobs", id] as const,
  tasks: (id: string) => ["jobs", id, "tasks"] as const, // new
};

// services.ts
export async function getJobTasks(id: string): Promise<Task[]> {
  const res = await fetch(`/api/jobs/${id}/tasks`, { cache: "no-store" });
  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch tasks"));
  return res.json() as Promise<Task[]>;
}

// jobs.ts
export function useJobTasks(id: string) {
  return useQuery({
    queryKey: jobKeys.tasks(id),
    queryFn: () => getJobTasks(id),
    enabled: Boolean(id),
  });
}
```

### Adding a new mutation hook

Always invalidate the affected query keys in `onSuccess`:

```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, task }: { jobId: string; task: CreateTaskInput }) =>
      createTask(jobId, task),
    onSuccess: (_data, { jobId }) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.tasks(jobId) });
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
    },
  });
}
```

### Using a mutation in a component

Never configure `onSuccess`/`onError` in the hook definition itself (only `invalidateQueries` goes there). Handle user feedback at the call site:

```typescript
const updateJob = useUpdateJob();

updateJob.mutate(
  { id, updates: { status: JobStatus.APPLIED } },
  {
    onSuccess: () => toast.success("Status uppdaterad."),
    onError: (error) => toast.error(error.message),
  },
);
```

---

## Query Keys

All query keys live in `src/lib/hooks/job-query-keys.ts`.

**Rules:**
- Always use the factory object (`jobKeys.all`, `jobKeys.detail(id)`) — never write raw arrays like `["jobs"]` inline
- Key hierarchy matters for invalidation: invalidating `["jobs"]` also invalidates `["jobs", id]`
- When adding a new entity, add its keys to the same file or a parallel `entityKeys.ts` file

---

## Services Layer (`src/app/services/services.ts`)

The services layer is the only place that calls `fetch()` to API routes from the client.

**Rules:**
- One function per API operation
- Always check `res.ok` and throw with `getErrorMessage()` so TanStack Query catches it
- Never put business logic here — just the fetch and error wrapping
- Exported functions are used directly as `queryFn` / `mutationFn` in hooks

---

## API Routes (`src/app/api/`)

**Rules:**
- Authenticate first: every route that touches user data must check `auth()` or `currentUser()` before anything else
- Return `{ error: string }` JSON for all error responses — this is what `getErrorMessage()` in services reads
- Wrap every Prisma call in try/catch. On error: call `logger.error(...)`, then `Sentry.captureException(...)`, then return 500
- External `fetch` calls (e.g. Arbetsförmedlingen) should return 503 on network failure, not 500
- Never return user data belonging to a different `userId` — always scope Prisma queries with `where: { userId }`

**Standard error pattern:**
```typescript
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

let result;
try {
  result = await prisma.job.findMany({ where: { userId } });
} catch (err) {
  logger.error("Failed to fetch jobs", { userId });
  Sentry.captureException(err, { tags: { route: "GET /api/jobs" } });
  return NextResponse.json({ error: "Det gick inte att hämta jobben." }, { status: 500 });
}
```

**HTTP status codes to use:**

| Status | When |
|---|---|
| `200` | Successful GET, PATCH, DELETE |
| `201` | Successful POST (resource created) |
| `400` | Invalid input / missing required fields |
| `401` | Not authenticated |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `500` | Unexpected server / database error |
| `503` | External upstream service unreachable |

---

## Prisma (`src/lib/prisma.ts`)

**Rules:**
- Use the singleton `prisma` instance imported from `@/lib/prisma` — never instantiate `PrismaClient` directly
- Only use Prisma inside `/api/*` routes or `src/server/queries.ts` — never in pages, components, or hooks
- Always scope queries by `userId` for user-owned resources
- Status values are stored in snake_case in the DB (`in_process`) and mapped to/from `JobStatus` enum at the route boundary using `prismaStatusToAppStatus` / `appStatusToPrisma`

---

## Server-side Prefetch (`src/server/queries.ts`)

Used to seed TanStack Query's cache from Server Components before the client hydrates. This avoids a loading flash on initial page load.

**Rules:**
- Functions here must be `async` and call `auth()` directly — they run on the server, not in an API route
- Return empty arrays or `null` on auth failure — never throw (so the page still renders)
- The result is passed into a `<HydrationBoundary>` with `dehydrate(queryClient)` in the Server Component

**Pattern:**
```typescript
// page.tsx (Server Component)
const queryClient = makeQueryClient();
await queryClient.prefetchQuery({
  queryKey: jobKeys.all,
  queryFn: getJobsServer,
});

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <ClientComponent />
  </HydrationBoundary>
);
```

---

## Logging

Use `src/lib/logger.ts` in API routes to log operations. Never use `console.log` directly in routes.

```typescript
import { logger } from "@/lib/logger";

logger.info("Fetching jobs", { userId });
logger.error("Prisma query failed", { userId, operation: "findMany" });
```

`warn` and `error` entries are forwarded to Sentry as breadcrumbs attached to the next captured error event.

---

## Types

All shared data types are in `src/app/types.ts`:

| Type | Used for |
|---|---|
| `Job` | Full job object returned from API |
| `CreateJobInput` | Body of POST /api/jobs |
| `UpdateJobInput` | Body of PATCH /api/jobs/[jobId] |
| `JobStatus` | Enum of valid statuses |
| `AutofillPayload` | Data returned from /api/arbetsformedlingen |

**Rule:** Never define ad-hoc inline types for data shapes that cross a layer boundary (component ↔ hook ↔ service ↔ API). Always use or extend the shared types from `types.ts`.

---

## Checklist for adding a new data operation

- [ ] Type defined in `src/app/types.ts`
- [ ] API route created under `src/app/api/` with auth check + try/catch on all Prisma calls
- [ ] Service function added to `src/app/services/services.ts`
- [ ] Query key added to `src/lib/hooks/job-query-keys.ts`
- [ ] Hook added to `src/lib/hooks/jobs.ts` with correct cache invalidation
- [ ] If server-prefetched: function added to `src/server/queries.ts`
- [ ] Error handled at call site with `toast.error(error.message)`
