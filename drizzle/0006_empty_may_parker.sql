CREATE TABLE IF NOT EXISTS "vihub_label" (
	"id" varchar PRIMARY KEY NOT NULL,
	"detail" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"imageId" varchar NOT NULL,
	"labelClassId" varchar NOT NULL
);
