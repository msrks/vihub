CREATE TABLE IF NOT EXISTS "vihub_image" (
	"id" varchar PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"downloadUrl" varchar NOT NULL,
	"pathname" varchar NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"imageStoreId" varchar NOT NULL,
	"aiLabelId" varchar,
	"humanLabelId" varchar,
	CONSTRAINT "vihub_image_url_unique" UNIQUE("url"),
	CONSTRAINT "vihub_image_downloadUrl_unique" UNIQUE("downloadUrl"),
	CONSTRAINT "vihub_image_pathname_unique" UNIQUE("pathname")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "image_createdAt_idx" ON "vihub_image" ("created_at");