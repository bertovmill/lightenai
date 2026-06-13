export const meta = {
  name: 'migrate-supabase-routes',
  description: 'Convert server API routes from Supabase to Drizzle/Clerk/Blob',
  phases: [
    { title: 'Convert' },
    { title: 'Verify' },
  ],
}

// Shared conversion spec given to every agent.
const SPEC = `
You are migrating a Next.js (App Router) API route OFF Supabase and ONTO this new stack:
  - Database: Drizzle ORM + Neon Postgres. Import the db client from "@/db" and table
    objects from "@/db/schema".
  - Auth: Clerk. Import helpers from "@/lib/auth": getUserId() (Clerk user id string or null),
    getAuthUser() ({id, email} | null), isCurrentUserAdmin().
  - File storage: Vercel Blob. Import { uploadBlob } from "@/lib/blob"
    (uploadBlob(folder, filename, data, contentType) -> { url, ... }).

MANDATORY READING before you edit anything (use the Read tool):
  1. src/app/api/inquiries/route.ts        — a FULLY CONVERTED example of the target style
  2. src/app/api/feedback/route.ts         — converted example that ALSO uploads to Blob
  3. src/db/schema.ts                       — exact table export names + column names
  4. src/lib/auth.ts and src/lib/blob.ts    — the helper signatures

CRITICAL schema facts:
  - Table EXPORT names are camelCase (e.g. outreachContacts, socialLeads, socialConnections,
    deployedAgents, scheduledPosts, agentConfigOverrides, agentConfigVersions, columns, topics,
    posts, quizScores, agentDocuments, agentPreferences, agentIdeas, communityTasks, dailyProgress).
  - But COLUMN keys are snake_case (e.g. created_at, user_id, image_url, agent_id, scheduled_at).
    Match the old Supabase field names exactly — do NOT camelCase the columns.
  - Timestamps are mode:"string" (ISO strings in, ISO strings out). For "now", use
    new Date().toISOString().

CONVERSION RULES:
  - Remove all imports of "@/lib/supabase/*". Add only the imports you actually use.
  - createAdminClient() / service-role usage -> just use db directly (there is no RLS anymore).
  - createClient() + supabase.auth.getUser() -> use getAuthUser()/getUserId() from "@/lib/auth".
    The former user.id (a uuid) is now the Clerk user id STRING. Store it in user_id text columns.
    If a route returned 401 when no user, keep that behavior (if (!userId) return 401).
  - .from("t").select("*")          -> db.select().from(t)
  - .eq("col", v)                   -> .where(eq(t.col, v))   (import eq from "drizzle-orm")
  - .order("col",{ascending:false}) -> .orderBy(desc(t.col))  (import asc/desc from "drizzle-orm")
  - multiple filters                -> .where(and(eq(...), gte(...)))  (import and/gte/lte)
  - .insert([{...}]).select()       -> db.insert(t).values({...}).returning()
  - .update({...}).eq("id",id).select() -> db.update(t).set({...}).where(eq(t.id,id)).returning()
  - .delete().eq(...)               -> db.delete(t).where(eq(t.col,v))
  - .single()                       -> destructure [row] = await db.select()... .limit(1)
  - .upsert(...)                    -> db.insert(t).values(...).onConflictDoUpdate({ target: t.col, set: {...} })
  - supabase.storage.from("bucket").upload(name, buf,{contentType}) + getPublicUrl(name)
        -> const blob = await uploadBlob("bucket", name, buf, contentType); use blob.url
  - supabase.rpc("get_published_content") / get_all_content
        -> import { getPublishedContent, getAllContent } from "@/lib/content"

PRESERVE EXACTLY: all request validation, status codes, JSON response shapes/keys, email sending
(Resend), error logging behavior, and any non-Supabase logic. This is a refactor, not a redesign.
Keep the existing { data } / { success: true, data } response envelopes the client expects.

If you find a table or column that does NOT exist in src/db/schema.ts, do NOT invent it — report it
as a blocker and leave that part as close to working as you can.
`

const RETURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['filesChanged', 'blockers', 'notes'],
  properties: {
    filesChanged: { type: 'array', items: { type: 'string' } },
    tablesUsed: { type: 'array', items: { type: 'string' } },
    blockers: {
      type: 'array',
      items: { type: 'string' },
      description: 'Missing tables/columns or anything you could not faithfully convert',
    },
    notes: { type: 'string' },
  },
}

// Logical batches — distinct files per agent so parallel edits never collide.
const BATCHES = [
  { label: 'crm-leads', files: ['src/app/api/outreach/route.ts', 'src/app/api/social-leads/route.ts'] },
  { label: 'content-crud', files: ['src/app/api/content/route.ts'] },
  { label: 'visuals', files: ['src/app/api/visuals/route.ts', 'src/app/api/visuals/save/route.ts'] },
  { label: 'social-post', files: ['src/app/api/social/connections/route.ts', 'src/app/api/social/post/route.ts', 'src/app/api/social/schedule/route.ts'] },
  { label: 'cron', files: ['src/app/api/cron/publish-scheduled/route.ts'] },
  { label: 'agent-config', files: ['src/app/api/agents/config/[agentId]/route.ts', 'src/app/api/agents/config/[agentId]/versions/route.ts'] },
  { label: 'agent-deploy', files: ['src/app/api/agents/deploy/route.ts', 'src/app/api/agents/dynamic/[slug]/route.ts', 'src/app/api/agents/route.ts'] },
  { label: 'agent-chat', files: ['src/app/api/agents/content-creator/route.ts', 'src/app/api/agents/data-analyst/route.ts', 'src/app/api/agents/sdk-tutor/route.ts'] },
  { label: 'data-analyst-tools', files: ['src/lib/agents/data-analyst/tools.ts'] },
  { label: 'oauth-x', files: ['src/app/api/auth/x/route.ts', 'src/app/api/auth/x/callback/route.ts'] },
  { label: 'oauth-linkedin', files: ['src/app/api/auth/linkedin/route.ts', 'src/app/api/auth/linkedin/callback/route.ts', 'src/app/api/auth/linkedin-org/route.ts', 'src/app/api/auth/linkedin-org/callback/route.ts'] },
  { label: 'oauth-misc', files: ['src/app/api/auth/facebook/route.ts', 'src/app/api/auth/instagram/route.ts', 'src/app/api/auth/medium/route.ts'] },
]

phase('Convert')
const results = await parallel(
  BATCHES.map((b) => () =>
    agent(
      `${SPEC}\n\nConvert ONLY these files (edit them in place with the Edit/Write tools):\n${b.files.map((f) => '  - ' + f).join('\n')}\n\nConvert each completely. Then return the structured result.`,
      { label: `convert:${b.label}`, phase: 'Convert', schema: RETURN_SCHEMA },
    ).then((r) => ({ batch: b.label, ...r })),
  ),
)

const clean = results.filter(Boolean)
const allBlockers = clean.flatMap((r) => (r.blockers || []).map((x) => `[${r.batch}] ${x}`))
const allFiles = clean.flatMap((r) => r.filesChanged || [])
log(`Converted ${allFiles.length} files across ${clean.length} batches. Blockers: ${allBlockers.length}`)

return {
  filesChanged: allFiles,
  blockers: allBlockers,
  perBatch: clean.map((r) => ({ batch: r.batch, files: r.filesChanged, notes: r.notes })),
}
