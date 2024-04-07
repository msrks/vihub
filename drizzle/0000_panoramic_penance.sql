DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('member', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_account" (
	"userId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"providerAccountId" varchar NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar,
	"scope" varchar,
	"id_token" text,
	"session_state" varchar,
	CONSTRAINT "vihub_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_session" (
	"sessionToken" varchar PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" varchar NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" varchar,
	"apiKey" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_users_to_workspaces" (
	"userId" varchar NOT NULL,
	"workspaceId" varchar NOT NULL,
	"role" "role",
	CONSTRAINT "vihub_users_to_workspaces_userId_workspaceId_pk" PRIMARY KEY("userId","workspaceId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_verificationToken" (
	"identifier" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "vihub_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_workspace" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"personal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "vihub_workspace_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "vihub_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "vihub_session" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_workspace_userId_idx" ON "vihub_users_to_workspaces" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_workspace_workspaceId_idx" ON "vihub_users_to_workspaces" ("workspaceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "createdAt_idx" ON "vihub_workspace" ("created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_account" ADD CONSTRAINT "vihub_account_userId_vihub_user_id_fk" FOREIGN KEY ("userId") REFERENCES "vihub_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_session" ADD CONSTRAINT "vihub_session_userId_vihub_user_id_fk" FOREIGN KEY ("userId") REFERENCES "vihub_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_users_to_workspaces" ADD CONSTRAINT "vihub_users_to_workspaces_userId_vihub_user_id_fk" FOREIGN KEY ("userId") REFERENCES "vihub_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_users_to_workspaces" ADD CONSTRAINT "vihub_users_to_workspaces_workspaceId_vihub_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "vihub_workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
