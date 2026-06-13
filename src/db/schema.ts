// Drizzle schema — ported from the former Supabase SQL migrations.
//
// Design choice: TS property keys are snake_case and timestamps use mode:"string",
// so query results are shape-identical to the JSON the old Supabase client
// returned. That keeps every consuming component/route working unchanged — only
// the query *call sites* move from supabase.from() to Drizzle.
//
// Other changes from the Supabase era:
//  - user identity comes from Clerk, so every former `user_id uuid references
//    auth.users(id)` is now a plain `text` column holding the Clerk user id.
//  - Row Level Security is gone; access control lives in the app/API layer.
//  - get_published_content / get_all_content RPCs are replaced by typed queries
//    in src/lib/content.ts.

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
  unique,
} from "drizzle-orm/pg-core";

// Timestamps returned as ISO strings (matches old Supabase JSON shape).
const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "string" });

// ============================================================
// CONTENT: columns → topics → posts
// ============================================================

export const columns = pgTable(
  "columns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    owner_name: text("owner_name"),
    owner_avatar_url: text("owner_avatar_url"),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_columns_sort_order").on(t.sort_order)],
);

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    column_id: uuid("column_id")
      .notNull()
      .references(() => columns.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    image_url: text("image_url"),
    author: text("author"),
    published_date: date("published_date"),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_topics_column_id").on(t.column_id),
    index("idx_topics_sort_order").on(t.sort_order),
  ],
);

export const POST_PLATFORMS = [
  "website",
  "x",
  "medium",
  "linkedin",
  "instagram",
  "youtube",
] as const;

export const POST_STATUSES = ["draft", "published"] as const;

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topic_id: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    platform: text("platform", { enum: POST_PLATFORMS }).notNull(),
    title: text("title").notNull(),
    body: text("body"),
    url: text("url"),
    excerpt: text("excerpt"),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    published_at: ts("published_at"),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_posts_topic_id").on(t.topic_id),
    index("idx_posts_status").on(t.status),
    unique("posts_topic_platform_unique").on(t.topic_id, t.platform),
  ],
);

// ============================================================
// CONTENT IDEAS
// ============================================================

export const contentIdeas = pgTable("content_ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  created_at: ts("created_at").defaultNow(),
});

// ============================================================
// INQUIRIES (contact form leads)
// ============================================================

export const LEAD_STATUSES = ["lead", "targeted", "contacted"] as const;

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: ts("created_at").notNull().defaultNow(),
  email: text("email").notNull(),
  message: text("message"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  company: text("company"),
  role: text("role"),
  website: text("website"),
  company_size: text("company_size"),
  annual_revenue: text("annual_revenue"),
  project_budget: text("project_budget"),
  services: text("services"),
  status: text("status", { enum: LEAD_STATUSES }).notNull().default("lead"),
});

// ============================================================
// DAILY PROGRESS (morning dashboard)
// ============================================================

export const dailyProgress = pgTable(
  "daily_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    date: date("date").notNull(),
    progress: jsonb("progress").notNull(),
    created_at: ts("created_at").notNull().defaultNow(),
    updated_at: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("daily_progress_user_date_unique").on(t.user_id, t.date),
    index("idx_daily_progress_user_date").on(t.user_id, t.date),
  ],
);

// ============================================================
// FEEDBACK
// ============================================================

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: ts("created_at").notNull().defaultNow(),
  email: text("email"),
  page_url: text("page_url"),
  category: text("category"),
  message: text("message").notNull(),
  addressed: boolean("addressed").default(false),
  screenshot_url: text("screenshot_url"),
});

// ============================================================
// OUTREACH CONTACTS (CRM)
// ============================================================

export const OUTREACH_TYPES = ["warm", "cold", "referral"] as const;
export const OUTREACH_STATUSES = [
  "contacted",
  "replied",
  "meeting",
  "converted",
  "not_interested",
] as const;

export const outreachContacts = pgTable(
  "outreach_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    created_at: ts("created_at").notNull().defaultNow(),
    outreach_date: date("outreach_date").notNull(),
    name: text("name").notNull(),
    type: text("type", { enum: OUTREACH_TYPES }).notNull(),
    linkedin_url: text("linkedin_url"),
    notes: text("notes"),
    status: text("status", { enum: OUTREACH_STATUSES }).notNull().default("contacted"),
    source: text("source"),
  },
  (t) => [
    index("idx_outreach_contacts_date").on(t.outreach_date),
    index("idx_outreach_contacts_status").on(t.status),
  ],
);

// ============================================================
// REVIEWS
// ============================================================

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email"),
  rating: integer("rating"), // CHECK 1..5 enforced in app layer
  message: text("message").notNull(),
  created_at: ts("created_at").defaultNow(),
});

// ============================================================
// SOCIAL LEADS
// ============================================================

export const SOCIAL_LEAD_PLATFORMS = [
  "linkedin",
  "x",
  "medium",
  "youtube",
  "instagram",
  "tiktok",
] as const;

export const socialLeads = pgTable(
  "social_leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    created_at: ts("created_at").notNull().defaultNow(),
    platform: text("platform", { enum: SOCIAL_LEAD_PLATFORMS }).notNull(),
    contact_name: text("contact_name").notNull(),
    profile_url: text("profile_url"),
    message_summary: text("message_summary"),
    lead_date: date("lead_date").notNull().defaultNow(),
    status: text("status", { enum: LEAD_STATUSES }).notNull().default("lead"),
  },
  (t) => [
    index("idx_social_leads_platform").on(t.platform),
    index("idx_social_leads_date").on(t.lead_date),
    index("idx_social_leads_platform_date").on(t.platform, t.lead_date),
  ],
);

// ============================================================
// SOCIAL CONNECTIONS (OAuth token storage)
// ============================================================

export const SOCIAL_CONNECTION_PLATFORMS = [
  "x",
  "linkedin",
  "linkedin_org",
  "instagram",
  "medium",
  "facebook",
] as const;

export const socialConnections = pgTable(
  "social_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    platform: text("platform", { enum: SOCIAL_CONNECTION_PLATFORMS }).notNull(),
    access_token: text("access_token").notNull(),
    refresh_token: text("refresh_token"),
    token_expires_at: ts("token_expires_at"),
    platform_user_id: text("platform_user_id"),
    profile_name: text("profile_name"),
    profile_image: text("profile_image"),
    org_id: text("org_id"),
    org_name: text("org_name"),
    created_at: ts("created_at").defaultNow(),
    updated_at: ts("updated_at").defaultNow(),
  },
  (t) => [unique("social_connections_user_platform_unique").on(t.user_id, t.platform)],
);

// ============================================================
// AGENT DOCUMENTS
// ============================================================

export const agentDocuments = pgTable(
  "agent_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    session_id: text("session_id").notNull(),
    agent_id: text("agent_id").notNull().default("ray"),
    title: text("title"),
    content: text("content").notNull().default(""),
    created_at: ts("created_at").notNull().defaultNow(),
    updated_at: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique("agent_documents_user_session_unique").on(t.user_id, t.session_id),
    index("idx_agent_documents_user_session").on(t.user_id, t.session_id),
    index("idx_agent_documents_user_updated").on(t.user_id, t.updated_at),
  ],
);

// ============================================================
// AGENT IDEAS
// ============================================================

export const agentIdeas = pgTable(
  "agent_ideas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    text: text("text").notNull(),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_agent_ideas_user_id").on(t.user_id)],
);

// ============================================================
// DEPLOYED AGENTS
// ============================================================

export const deployedAgents = pgTable("deployed_agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: ts("created_at").defaultNow(),
  updated_at: ts("updated_at").defaultNow(),
  created_by: text("created_by"),

  agent_id: text("agent_id").notNull().unique(),

  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  icon_path: text("icon_path")
    .notNull()
    .default(
      "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    ),
  status: text("status").notNull().default("active"),
  capabilities: jsonb("capabilities").default([]),
  faq: jsonb("faq").default([]),
  architecture: jsonb("architecture"),

  placeholder: text("placeholder").default("Send a message..."),
  empty_state_title: text("empty_state_title").default("Start a conversation"),
  empty_state_description: text("empty_state_description").default(""),
  loading_text: text("loading_text").default("Thinking..."),
  starter_prompts: text("starter_prompts").array().default([]),

  system_prompt: text("system_prompt").notNull().default(""),
  allowed_tools: text("allowed_tools")
    .array()
    .default(["Read", "Glob", "Grep", "WebSearch", "WebFetch", "AskUserQuestion"]),
  agents: jsonb("agents"),
  permission_mode: text("permission_mode").default("bypassPermissions"),
});

// ============================================================
// AGENT PREFERENCES
// ============================================================

export const agentPreferences = pgTable(
  "agent_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    agent_id: text("agent_id").notNull(),
    custom_rules: jsonb("custom_rules").notNull().default([]),
    updated_at: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique("agent_preferences_user_agent_unique").on(t.user_id, t.agent_id),
    index("idx_agent_preferences_user_agent").on(t.user_id, t.agent_id),
  ],
);

// ============================================================
// QUIZ SCORES
// ============================================================

export const quizScores = pgTable(
  "quiz_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    date: date("date").notNull().defaultNow(),
    score: integer("score").notNull(),
    total: integer("total").notNull().default(5),
    session_id: text("session_id"),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_quiz_scores_user_date").on(t.user_id, t.date)],
);

// ============================================================
// SCHEDULED POSTS
// ============================================================

export const SCHEDULED_POST_PLATFORMS = [
  "x",
  "linkedin",
  "linkedin_org",
  "instagram",
  "medium",
  "facebook",
] as const;

export const SCHEDULED_POST_STATUSES = [
  "pending",
  "published",
  "failed",
  "cancelled",
] as const;

export const scheduledPosts = pgTable(
  "scheduled_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    platform: text("platform", { enum: SCHEDULED_POST_PLATFORMS }).notNull(),
    text: text("text").notNull(),
    image_url: text("image_url"),
    markdown_content: text("markdown_content"),
    as_organization: boolean("as_organization").default(false),
    scheduled_at: ts("scheduled_at").notNull(),
    status: text("status", { enum: SCHEDULED_POST_STATUSES })
      .notNull()
      .default("pending"),
    error_message: text("error_message"),
    post_id: text("post_id"),
    created_at: ts("created_at").defaultNow(),
    published_at: ts("published_at"),
  },
  (t) => [index("idx_scheduled_posts_pending").on(t.scheduled_at)],
);

// ============================================================
// COMMUNITY TASKS
// ============================================================

export const communityTasks = pgTable("community_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  is_completed: boolean("is_completed").notNull().default(false),
  created_at: ts("created_at").notNull().defaultNow(),
});

// ============================================================
// AGENT CONFIG OVERRIDES + VERSIONS
// ============================================================

export const agentConfigOverrides = pgTable("agent_config_overrides", {
  agent_id: text("agent_id").primaryKey(),
  system_prompt: text("system_prompt").notNull(),
  allowed_tools: text("allowed_tools").array().notNull().default([]),
  updated_at: ts("updated_at").defaultNow(),
});

export const agentConfigVersions = pgTable(
  "agent_config_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agent_id: text("agent_id").notNull(),
    system_prompt: text("system_prompt").notNull(),
    allowed_tools: text("allowed_tools").array().notNull().default([]),
    source: text("source").notNull().default("ui"),
    note: text("note"),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_config_versions_agent").on(t.agent_id, t.created_at)],
);

// ============================================================
// GENERATED VISUALS (saved AI-generated images)
// ============================================================

export const generatedVisuals = pgTable("generated_visuals", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  name: text("name"),
  preset: text("preset").notNull().default("hero"),
  storage_path: text("storage_path"),
  created_at: ts("created_at").notNull().defaultNow(),
});

// ============================================================
// COACH SESSIONS (SMS life coach — one rolling managed-agent session per phone)
// ============================================================

export const coachSessions = pgTable("coach_sessions", {
  phone: text("phone").primaryKey(),
  session_id: text("session_id").notNull(),
  updated_at: ts("updated_at").notNull().defaultNow(),
});
