CREATE TABLE "agent_config_overrides" (
	"agent_id" text PRIMARY KEY NOT NULL,
	"system_prompt" text NOT NULL,
	"allowed_tools" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_config_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" text NOT NULL,
	"system_prompt" text NOT NULL,
	"allowed_tools" text[] DEFAULT '{}' NOT NULL,
	"source" text DEFAULT 'ui' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" text NOT NULL,
	"agent_id" text DEFAULT 'ray' NOT NULL,
	"title" text,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_documents_user_session_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "agent_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"custom_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_preferences_user_agent_unique" UNIQUE("user_id","agent_id")
);
--> statement-breakpoint
CREATE TABLE "columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"owner_name" text,
	"owner_avatar_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "columns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "community_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"progress" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployed_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" text,
	"agent_id" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon_path" text DEFAULT 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb,
	"faq" jsonb DEFAULT '[]'::jsonb,
	"architecture" jsonb,
	"placeholder" text DEFAULT 'Send a message...',
	"empty_state_title" text DEFAULT 'Start a conversation',
	"empty_state_description" text DEFAULT '',
	"loading_text" text DEFAULT 'Thinking...',
	"starter_prompts" text[] DEFAULT '{}',
	"system_prompt" text DEFAULT '' NOT NULL,
	"allowed_tools" text[] DEFAULT '{"Read","Glob","Grep","WebSearch","WebFetch","AskUserQuestion"}',
	"agents" jsonb,
	"permission_mode" text DEFAULT 'bypassPermissions',
	CONSTRAINT "deployed_agents_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text,
	"page_url" text,
	"category" text,
	"message" text NOT NULL,
	"addressed" boolean DEFAULT false,
	"screenshot_url" text
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"first_name" text,
	"last_name" text,
	"company" text,
	"role" text,
	"website" text,
	"company_size" text,
	"annual_revenue" text,
	"project_budget" text,
	"services" text,
	"status" text DEFAULT 'lead' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"outreach_date" date NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"linkedin_url" text,
	"notes" text,
	"status" text DEFAULT 'contacted' NOT NULL,
	"source" text
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"url" text,
	"excerpt" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_topic_platform_unique" UNIQUE("topic_id","platform")
);
--> statement-breakpoint
CREATE TABLE "quiz_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"score" integer NOT NULL,
	"total" integer DEFAULT 5 NOT NULL,
	"session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"rating" integer,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"text" text NOT NULL,
	"image_url" text,
	"markdown_content" text,
	"as_organization" boolean DEFAULT false,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"post_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "social_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"platform_user_id" text,
	"profile_name" text,
	"profile_image" text,
	"org_id" text,
	"org_name" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "social_connections_user_platform_unique" UNIQUE("user_id","platform")
);
--> statement-breakpoint
CREATE TABLE "social_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"platform" text NOT NULL,
	"contact_name" text NOT NULL,
	"profile_url" text,
	"message_summary" text,
	"lead_date" date DEFAULT now() NOT NULL,
	"status" text DEFAULT 'lead' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"column_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"author" text,
	"published_date" date,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_column_id_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_config_versions_agent" ON "agent_config_versions" USING btree ("agent_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_agent_documents_user_session" ON "agent_documents" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "idx_agent_documents_user_updated" ON "agent_documents" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "idx_agent_ideas_user_id" ON "agent_ideas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_preferences_user_agent" ON "agent_preferences" USING btree ("user_id","agent_id");--> statement-breakpoint
CREATE INDEX "idx_columns_sort_order" ON "columns" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_progress_user_date_unique" ON "daily_progress" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_daily_progress_user_date" ON "daily_progress" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_outreach_contacts_date" ON "outreach_contacts" USING btree ("outreach_date");--> statement-breakpoint
CREATE INDEX "idx_outreach_contacts_status" ON "outreach_contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_posts_topic_id" ON "posts" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_posts_status" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_quiz_scores_user_date" ON "quiz_scores" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_scheduled_posts_pending" ON "scheduled_posts" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_social_leads_platform" ON "social_leads" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "idx_social_leads_date" ON "social_leads" USING btree ("lead_date");--> statement-breakpoint
CREATE INDEX "idx_social_leads_platform_date" ON "social_leads" USING btree ("platform","lead_date");--> statement-breakpoint
CREATE INDEX "idx_topics_column_id" ON "topics" USING btree ("column_id");--> statement-breakpoint
CREATE INDEX "idx_topics_sort_order" ON "topics" USING btree ("sort_order");