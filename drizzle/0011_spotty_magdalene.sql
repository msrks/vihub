DO $$ BEGIN
 CREATE TYPE "public"."annotationTypeEnum" AS ENUM('ai', 'human');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_labelsClsM" (
	"imageId" integer NOT NULL,
	"labelClassId" integer NOT NULL,
	CONSTRAINT "vihub_labelsClsM_imageId_labelClassId_pk" PRIMARY KEY("imageId","labelClassId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_labelsDet" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "annotationTypeEnum" NOT NULL,
	"xMin" integer NOT NULL,
	"yMin" integer NOT NULL,
	"xMax" integer NOT NULL,
	"yMax" integer NOT NULL,
	"imageId" integer NOT NULL,
	"labelClassId" integer NOT NULL,
	"confidence" real,
	"aiModelKey" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_training_job" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "type" NOT NULL,
	"state" varchar NOT NULL,
	"numImages" integer NOT NULL,
	"numTrain" integer,
	"numTest" integer,
	"numValid" integer,
	"modelId" varchar,
	"datasetId" varchar NOT NULL,
	"importFilePath" varchar NOT NULL,
	"auPrc" real,
	"evalId" varchar,
	"logLoss" real,
	"confusionMatrix" jsonb,
	"dateRange" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"durationMinutes" integer,
	"updated_at" timestamp,
	"urlTFlite" varchar,
	"urlSavedModel" varchar,
	"urlTFJS" varchar,
	"imageStoreId" integer NOT NULL,
	CONSTRAINT "vihub_training_job_datasetId_unique" UNIQUE("datasetId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vihub_training_job_to_image" (
	"imageId" integer NOT NULL,
	"trainingJobId" integer NOT NULL,
	CONSTRAINT "vihub_training_job_to_image_imageId_trainingJobId_pk" PRIMARY KEY("imageId","trainingJobId")
);
--> statement-breakpoint
DROP TABLE "vihub_image_to_multi_label_class";--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "width" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "height" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "gsutilURI" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_image" ADD COLUMN "isLabeled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vihub_label_class" ADD COLUMN "type" "type" DEFAULT 'clsS' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_labelsClsM" ADD CONSTRAINT "vihub_labelsClsM_imageId_vihub_image_id_fk" FOREIGN KEY ("imageId") REFERENCES "public"."vihub_image"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_labelsClsM" ADD CONSTRAINT "vihub_labelsClsM_labelClassId_vihub_label_class_id_fk" FOREIGN KEY ("labelClassId") REFERENCES "public"."vihub_label_class"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_labelsDet" ADD CONSTRAINT "vihub_labelsDet_imageId_vihub_image_id_fk" FOREIGN KEY ("imageId") REFERENCES "public"."vihub_image"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_labelsDet" ADD CONSTRAINT "vihub_labelsDet_labelClassId_vihub_label_class_id_fk" FOREIGN KEY ("labelClassId") REFERENCES "public"."vihub_label_class"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vihub_training_job" ADD CONSTRAINT "vihub_training_job_imageStoreId_vihub_image_store_id_fk" FOREIGN KEY ("imageStoreId") REFERENCES "public"."vihub_image_store"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_job_createdAt_idx" ON "vihub_training_job" ("created_at");--> statement-breakpoint
ALTER TABLE "vihub_label_class" DROP COLUMN IF EXISTS "isMultiClass";