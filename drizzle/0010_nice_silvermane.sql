DO $$ BEGIN
 CREATE TYPE "type" AS ENUM('clsS', 'clsM', 'det', 'seg');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_ai_model" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"displayName" varchar NOT NULL,
	"url" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_experiment_result" (
	"id" serial PRIMARY KEY NOT NULL,
	"isPositiveExample" boolean NOT NULL,
	"predLabel" boolean NOT NULL,
	"predReason" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"promptingExperimentId" integer NOT NULL,
	"imageId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_image_to_multi_label_class" (
	"imageId" integer NOT NULL,
	"labelClassId" integer NOT NULL,
	CONSTRAINT "vihub_image_to_multi_label_class_imageId_labelClassId_pk" PRIMARY KEY("imageId","labelClassId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_multi_class_ai_prediction" (
	"id" serial PRIMARY KEY NOT NULL,
	"imageId" integer NOT NULL,
	"labelClassId" integer NOT NULL,
	"isPositive" boolean NOT NULL,
	"confidence" real NOT NULL,
	"aiModelId" integer,
	"aiModelKey" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_prompting_experiment" (
	"id" serial PRIMARY KEY NOT NULL,
	"specDefinition" varchar NOT NULL,
	"referenceImages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"scorePositive" varchar,
	"scoreNegative" varchar,
	"imageStoreId" integer NOT NULL,
	"labelClassId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_reference_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"downloadUrl" varchar NOT NULL,
	"description" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"isPositive" boolean DEFAULT true NOT NULL,
	"imageStoreId" integer NOT NULL,
	"labelClassId" integer,
	CONSTRAINT "vihub_reference_image_url_unique" UNIQUE("url"),
	CONSTRAINT "vihub_reference_image_downloadUrl_unique" UNIQUE("downloadUrl")
);
--> statement-breakpoint
DROP TABLE "vihub_label";--> statement-breakpoint
ALTER TABLE "vihub_image" DROP CONSTRAINT "vihub_image_pathname_unique";--> statement-breakpoint
ALTER TABLE "vihub_users_to_workspaces" DROP CONSTRAINT "vihub_users_to_workspaces_workspaceId_vihub_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "vihub_image" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "vihub_image_store" ADD COLUMN "type" "type" DEFAULT 'clsS' NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image_store" ADD COLUMN "thumbnailUrl" varchar;--> statement-breakpoint
ALTER TABLE "vihub_image_store" ADD COLUMN "imageWidth" integer DEFAULT 200 NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image_store" ADD COLUMN "imageHeight" integer DEFAULT 150 NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image_store" ADD COLUMN "colWidth" integer DEFAULT 200 NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "vectorId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "selectedForExperiment" boolean;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "created_at_date" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "aiLabelDetail" jsonb;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "humanLabelDetail" jsonb;--> statement-breakpoint
ALTER TABLE "vihub_label_class" ADD COLUMN "color" varchar DEFAULT '#555555' NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_label_class" ADD COLUMN "specDefinition" varchar;--> statement-breakpoint
ALTER TABLE "vihub_label_class" ADD COLUMN "isMultiClass" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_workspace" ADD COLUMN "apiKey" varchar;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "experiment_result_createdAt_idx" ON "vihub_experiment_result" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prompting_experiment_createdAt_idx" ON "vihub_prompting_experiment" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reference_image_createdAt_idx" ON "vihub_reference_image" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "image_createdAtDate_idx" ON "vihub_image" ("created_at_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "image_imageStoreId_idx" ON "vihub_image" ("imageStoreId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_image_store" ADD CONSTRAINT "vihub_image_store_workspaceId_vihub_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "vihub_workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_image" ADD CONSTRAINT "vihub_image_imageStoreId_vihub_image_store_id_fk" FOREIGN KEY ("imageStoreId") REFERENCES "vihub_image_store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_image" ADD CONSTRAINT "vihub_image_aiLabelId_vihub_label_class_id_fk" FOREIGN KEY ("aiLabelId") REFERENCES "vihub_label_class"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_image" ADD CONSTRAINT "vihub_image_humanLabelId_vihub_label_class_id_fk" FOREIGN KEY ("humanLabelId") REFERENCES "vihub_label_class"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_label_class" ADD CONSTRAINT "vihub_label_class_imageStoreId_vihub_image_store_id_fk" FOREIGN KEY ("imageStoreId") REFERENCES "vihub_image_store"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_users_to_workspaces" ADD CONSTRAINT "vihub_users_to_workspaces_workspaceId_vihub_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "vihub_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "vihub_image_store" DROP COLUMN IF EXISTS "thumbnailId";--> statement-breakpoint
ALTER TABLE "vihub_image" DROP COLUMN IF EXISTS "pathname";--> statement-breakpoint
ALTER TABLE "vihub_user" DROP COLUMN IF EXISTS "apiKey";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_experiment_result" ADD CONSTRAINT "vihub_experiment_result_promptingExperimentId_vihub_prompting_experiment_id_fk" FOREIGN KEY ("promptingExperimentId") REFERENCES "vihub_prompting_experiment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_experiment_result" ADD CONSTRAINT "vihub_experiment_result_imageId_vihub_image_id_fk" FOREIGN KEY ("imageId") REFERENCES "vihub_image"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_image_to_multi_label_class" ADD CONSTRAINT "vihub_image_to_multi_label_class_imageId_vihub_image_id_fk" FOREIGN KEY ("imageId") REFERENCES "vihub_image"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_image_to_multi_label_class" ADD CONSTRAINT "vihub_image_to_multi_label_class_labelClassId_vihub_label_class_id_fk" FOREIGN KEY ("labelClassId") REFERENCES "vihub_label_class"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_prompting_experiment" ADD CONSTRAINT "vihub_prompting_experiment_imageStoreId_vihub_image_store_id_fk" FOREIGN KEY ("imageStoreId") REFERENCES "vihub_image_store"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_prompting_experiment" ADD CONSTRAINT "vihub_prompting_experiment_labelClassId_vihub_label_class_id_fk" FOREIGN KEY ("labelClassId") REFERENCES "vihub_label_class"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_reference_image" ADD CONSTRAINT "vihub_reference_image_imageStoreId_vihub_image_store_id_fk" FOREIGN KEY ("imageStoreId") REFERENCES "vihub_image_store"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_reference_image" ADD CONSTRAINT "vihub_reference_image_labelClassId_vihub_label_class_id_fk" FOREIGN KEY ("labelClassId") REFERENCES "vihub_label_class"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "vihub_image" ADD CONSTRAINT "vihub_image_vectorId_unique" UNIQUE("vectorId");--> statement-breakpoint
ALTER TABLE "vihub_label_class" ADD CONSTRAINT "unique_image_store_and_key" UNIQUE("imageStoreId","key");