ALTER TABLE "vihub_users_to_workspaces" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_users_to_workspaces" ALTER COLUMN "workspaceId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_users_to_workspaces" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "vihub_users_to_workspaces" ALTER COLUMN "role" SET NOT NULL;