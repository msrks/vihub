DROP INDEX IF EXISTS "createdAt_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_createdAt_idx" ON "vihub_workspace" ("created_at");