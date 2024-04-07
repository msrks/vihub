CREATE TABLE IF NOT EXISTS "vihub_image_store" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp,
	"thumbnailId" varchar,
	"workspaceId" varchar NOT NULL
);
