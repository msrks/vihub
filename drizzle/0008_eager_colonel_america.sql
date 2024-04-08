ALTER TABLE "vihub_image_store" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "vihub_image_store" ALTER COLUMN "thumbnailId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_image_store" ALTER COLUMN "workspaceId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_image" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "vihub_image" ALTER COLUMN "imageStoreId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_image" ALTER COLUMN "aiLabelId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_image" ALTER COLUMN "humanLabelId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_label_class" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "vihub_label_class" ALTER COLUMN "imageStoreId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_label" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "vihub_label" ALTER COLUMN "imageId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_label" ALTER COLUMN "labelClassId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_users_to_workspaces" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_users_to_workspaces" ALTER COLUMN "workspaceId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "vihub_users_to_workspaces" ALTER COLUMN "workspaceId" DROP NOT NULL;