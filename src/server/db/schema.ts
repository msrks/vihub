import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

import type { AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `vihub_${name}`);

// Enums

export const imageStoreTypeList = ["clsS", "clsM", "det"] as const;
export type ImageStoreType = (typeof imageStoreTypeList)[number];
export const typeEnum = pgEnum("type", imageStoreTypeList);
export const roleEnum = pgEnum("role", ["member", "admin"]);
export const annotationTypeEnum = pgEnum("annotationTypeEnum", ["ai", "human"]);

// Tables, Relations

export const users = createTable("user", {
  id: varchar("id").notNull().primaryKey(),
  name: varchar("name"),
  email: varchar("email").notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  usersToWorkspaces: many(usersToWorkspaces),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId")
      .notNull()
      .references(() => users.id),
    type: varchar("type").$type<AdapterAccount["type"]>().notNull(),
    provider: varchar("provider").notNull(),
    providerAccountId: varchar("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type"),
    scope: varchar("scope"),
    id_token: text("id_token"),
    session_state: varchar("session_state"),
  },
  (account) => ({
    pk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken").notNull().primaryKey(),
    expires: timestamp("expires", { mode: "date" }).notNull(),

    userId: varchar("userId")
      .notNull()
      .references(() => users.id),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier").notNull(),
    token: varchar("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const workspaces = createTable(
  "workspace",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull().unique(),
    personal: boolean("personal").default(false).notNull(),
    apiKey: varchar("apiKey"),

    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    createdAtIdx: index("workspace_createdAt_idx").on(table.createdAt),
  }),
);

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  usersToWorkspaces: many(usersToWorkspaces),
  imageStores: many(imageStores),
}));

export const usersToWorkspaces = createTable(
  "users_to_workspaces",
  {
    role: roleEnum("role").default("member").notNull(),

    userId: varchar("userId")
      .notNull()
      .references(() => users.id, { onDelete: "no action" }),
    workspaceId: integer("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
    userIdIdx: index("user_workspace_userId_idx").on(t.userId),
    workspaceIdIdx: index("user_workspace_workspaceId_idx").on(t.workspaceId),
  }),
);

export const usersToWorkspacesRelations = relations(
  usersToWorkspaces,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToWorkspaces.userId],
      references: [users.id],
    }),
    workspace: one(workspaces, {
      fields: [usersToWorkspaces.workspaceId],
      references: [workspaces.id],
    }),
  }),
);

export const imageStores = createTable(
  "image_store",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    type: typeEnum("type").default("clsS").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
    thumbnailUrl: varchar("thumbnailUrl"),

    workspaceId: integer("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "no action" }),
    imageWidth: integer("imageWidth").default(200).notNull(),
    imageHeight: integer("imageHeight").default(150).notNull(),
    colWidth: integer("colWidth").default(200).notNull(),
  },
  (t) => ({
    createdAtIdx: index("image_store_createdAt_idx").on(t.createdAt),
  }),
);

export const imageStoresRelations = relations(imageStores, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [imageStores.workspaceId],
    references: [workspaces.id],
  }),
  images: many(images),
  labelClasses: many(labelClasses),
  promptingExperiments: many(promptingExperiments),
  referenceImages: many(referenceImages),
  trainingJobs: many(trainingJobs),
}));

export const labelClasses = createTable(
  "label_class",
  {
    id: serial("id").primaryKey(),
    key: varchar("key").notNull(),
    displayName: varchar("displayName").notNull(),
    color: varchar("color").default("#555555").notNull(),
    specDefinition: varchar("specDefinition"),
    type: typeEnum("type").default("clsS").notNull(),

    imageStoreId: integer("imageStoreId")
      .notNull()
      .references(() => imageStores.id, { onDelete: "cascade" }),
  },
  (t) => ({
    uniqueImageStoreAndKey: unique("unique_image_store_and_key").on(
      t.imageStoreId,
      t.key,
    ),
  }),
);

export const labelClassesRelations = relations(
  labelClasses,
  ({ one, many }) => ({
    imageStore: one(imageStores, {
      fields: [labelClasses.imageStoreId],
      references: [imageStores.id],
    }),
    humanLabeledImages: many(images, { relationName: "humanLabel" }),
    aiLabeledImages: many(images, { relationName: "aiLabel" }),
    promptingExperiments: many(promptingExperiments),
    referenceImages: many(referenceImages),
    multiClassAiPredictions: many(multiClassAiPredictions),
    labelsClsM: many(labelsClsM),
    labelsDet: many(labelsDet),
  }),
);

export const images = createTable(
  "image",
  {
    id: serial("id").primaryKey(),
    url: varchar("url").notNull().unique(),
    width: integer("width").default(1).notNull(),
    height: integer("height").default(1).notNull(),
    gsutilURI: varchar("gsutilURI").notNull(),
    vectorId: varchar("vectorId").notNull().unique(),
    downloadUrl: varchar("downloadUrl").notNull().unique(),
    selectedForExperiment: boolean("selectedForExperiment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdAtDate: date("created_at_date").defaultNow().notNull(),
    isLabeled: boolean("isLabeled").default(false).notNull(),

    imageStoreId: integer("imageStoreId")
      .notNull()
      .references(() => imageStores.id, { onDelete: "no action" }),
    aiLabelId: integer("aiLabelId").references(() => labelClasses.id, {
      onDelete: "set null",
    }),
    aiLabelDetail: jsonb("aiLabelDetail").$type<{ confidence: number }>(),
    humanLabelId: integer("humanLabelId").references(() => labelClasses.id, {
      onDelete: "set null",
    }),
    humanLabelDetail: jsonb("humanLabelDetail"),
  },
  (t) => ({
    createdAtIdx: index("image_createdAt_idx").on(t.createdAt),
    createdAtDateIdx: index("image_createdAtDate_idx").on(t.createdAtDate),
    imageStoreIdIdx: index("image_imageStoreId_idx").on(t.imageStoreId),
  }),
);

export const imagesRelations = relations(images, ({ one, many }) => ({
  imageStore: one(imageStores, {
    fields: [images.imageStoreId],
    references: [imageStores.id],
  }),
  aiLabel: one(labelClasses, {
    fields: [images.aiLabelId],
    references: [labelClasses.id],
    relationName: "aiLabel",
  }),
  humanLabel: one(labelClasses, {
    fields: [images.humanLabelId],
    references: [labelClasses.id],
    relationName: "humanLabel",
  }),
  experimentResults: many(experimentResults),
  multiClassAiPredictions: many(multiClassAiPredictions),
  labelsClsM: many(labelsClsM),
  labelsDet: many(labelsDet),
  trainingJobsToImages: many(trainingJobsToImages),
}));

export const labelsClsM = createTable(
  "labelsClsM",
  {
    imageId: integer("imageId")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    labelClassId: integer("labelClassId")
      .notNull()
      .references(() => labelClasses.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.imageId, t.labelClassId] }),
  }),
);

export const labelsClsMRelations = relations(labelsClsM, ({ one }) => ({
  image: one(images, {
    fields: [labelsClsM.imageId],
    references: [images.id],
  }),
  labelClass: one(labelClasses, {
    fields: [labelsClsM.labelClassId],
    references: [labelClasses.id],
  }),
}));

export const labelsDet = createTable("labelsDet", {
  id: serial("id").primaryKey(),
  type: annotationTypeEnum("type").notNull(),
  xMin: integer("xMin").notNull(),
  yMin: integer("yMin").notNull(),
  xMax: integer("xMax").notNull(),
  yMax: integer("yMax").notNull(),
  imageId: integer("imageId")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  labelClassId: integer("labelClassId")
    .notNull()
    .references(() => labelClasses.id, { onDelete: "cascade" }),

  confidence: real("confidence"),
  aiModelKey: varchar("aiModelKey"),
});

export const labelsDetRelations = relations(labelsDet, ({ one }) => ({
  image: one(images, {
    fields: [labelsDet.imageId],
    references: [images.id],
  }),
  labelClass: one(labelClasses, {
    fields: [labelsDet.labelClassId],
    references: [labelClasses.id],
  }),
}));

export const multiClassAiPredictions = createTable(
  "multi_class_ai_prediction",
  {
    id: serial("id").primaryKey(),
    imageId: integer("imageId").notNull(),
    labelClassId: integer("labelClassId").notNull(),
    isPositive: boolean("isPositive").notNull(),
    confidence: real("confidence").notNull(),
    aiModelId: integer("aiModelId"),
    aiModelKey: varchar("aiModelKey"),
  },
);

export const multiClassAiPredictionsRelations = relations(
  multiClassAiPredictions,
  ({ one }) => ({
    image: one(images, {
      fields: [multiClassAiPredictions.imageId],
      references: [images.id],
    }),
    labelClass: one(labelClasses, {
      fields: [multiClassAiPredictions.labelClassId],
      references: [labelClasses.id],
    }),
    aiModel: one(aiModels, {
      fields: [multiClassAiPredictions.aiModelId],
      references: [aiModels.id],
    }),
  }),
);

export const aiModels = createTable("ai_model", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull(),
  displayName: varchar("displayName").notNull(),
  url: varchar("url"),
});

export const aiModelsRelations = relations(aiModels, ({ many }) => ({
  multiClassAiPredictions: many(multiClassAiPredictions),
}));

type ReferenceImage = {
  url: string;
  description: string;
  isPositive: boolean;
};

export const promptingExperiments = createTable(
  "prompting_experiment",
  {
    id: serial("id").primaryKey(),
    specDefinition: varchar("specDefinition").notNull(),
    referenceImages: jsonb("referenceImages")
      .$type<ReferenceImage[]>()
      .default([])
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    scorePositive: varchar("scorePositive"),
    scoreNegative: varchar("scoreNegative"),

    imageStoreId: integer("imageStoreId")
      .notNull()
      .references(() => imageStores.id, { onDelete: "cascade" }),
    labelClassId: integer("labelClassId")
      .notNull()
      .references(() => labelClasses.id, { onDelete: "no action" }),
  },
  (t) => ({
    createdAtIdx: index("prompting_experiment_createdAt_idx").on(t.createdAt),
  }),
);

export const promptingExperimentsRelations = relations(
  promptingExperiments,
  ({ one, many }) => ({
    imageStore: one(imageStores, {
      fields: [promptingExperiments.imageStoreId],
      references: [imageStores.id],
    }),
    labelClass: one(labelClasses, {
      fields: [promptingExperiments.labelClassId],
      references: [labelClasses.id],
    }),
    experimentResults: many(experimentResults),
  }),
);

export const experimentResults = createTable(
  "experiment_result",
  {
    id: serial("id").primaryKey(),
    isPositiveExample: boolean("isPositiveExample").notNull(),
    predLabel: boolean("predLabel").notNull(),
    predReason: varchar("predReason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),

    promptingExperimentId: integer("promptingExperimentId")
      .notNull()
      .references(() => promptingExperiments.id, { onDelete: "cascade" }),
    imageId: integer("imageId")
      .notNull()
      .references(() => images.id, {
        onDelete: "cascade",
      }),
  },
  (t) => ({
    createdAtIdx: index("experiment_result_createdAt_idx").on(t.createdAt),
  }),
);

export const experimentResultsRelations = relations(
  experimentResults,
  ({ one }) => ({
    promptingExperiment: one(promptingExperiments, {
      fields: [experimentResults.promptingExperimentId],
      references: [promptingExperiments.id],
    }),
    image: one(images, {
      fields: [experimentResults.imageId],
      references: [images.id],
    }),
  }),
);

export const referenceImages = createTable(
  "reference_image",
  {
    id: serial("id").primaryKey(),
    url: varchar("url").notNull().unique(),
    downloadUrl: varchar("downloadUrl").notNull().unique(),
    description: varchar("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    isPositive: boolean("isPositive").default(true).notNull(),

    imageStoreId: integer("imageStoreId")
      .notNull()
      .references(() => imageStores.id, { onDelete: "cascade" }),
    labelClassId: integer("labelClassId").references(() => labelClasses.id, {
      onDelete: "set null",
    }),
  },
  (t) => ({
    createdAtIdx: index("reference_image_createdAt_idx").on(t.createdAt),
  }),
);

export const referenceImagesRelations = relations(
  referenceImages,
  ({ one }) => ({
    imageStore: one(imageStores, {
      fields: [referenceImages.imageStoreId],
      references: [imageStores.id],
    }),
    labelClass: one(labelClasses, {
      fields: [referenceImages.labelClassId],
      references: [labelClasses.id],
    }),
  }),
);

export const trainingJobs = createTable(
  "training_job",
  {
    id: serial("id").primaryKey(),
    type: typeEnum("type").notNull(),
    state: varchar("state").notNull(),
    numImages: integer("numImages").notNull(),
    numTrain: integer("numTrain"),
    numTest: integer("numTest"),
    numValid: integer("numValid"),
    modelId: varchar("modelId"),
    datasetId: varchar("datasetId").notNull().unique(),
    importFilePath: varchar("importFilePath").notNull(),
    auPrc: real("auPrc"),
    evalId: varchar("evalId"),
    logLoss: real("logLoss"),
    confusionMatrix: jsonb("confusionMatrix").$type<{
      annotationSpecs: { id: string; displayName: string }[];
      rows: { values: number[] }[];
    }>(),
    dateRange: jsonb("dateRange").$type<{ start: string; end: string }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    durationMinutes: integer("durationMinutes"),
    updatedAt: timestamp("updated_at"),
    urlTFlite: varchar("urlTFlite"),
    urlSavedModel: varchar("urlSavedModel"),
    urlTFJS: varchar("urlTFJS"),

    imageStoreId: integer("imageStoreId")
      .notNull()
      .references(() => imageStores.id, { onDelete: "cascade" }),
  },
  (t) => ({
    createdAtIdx: index("training_job_createdAt_idx").on(t.createdAt),
  }),
);

export const trainingJobsRelations = relations(
  trainingJobs,
  ({ one, many }) => ({
    imageStore: one(imageStores, {
      fields: [trainingJobs.imageStoreId],
      references: [imageStores.id],
    }),
    trainingJobsToImages: many(trainingJobsToImages),
  }),
);

export const trainingJobsToImages = createTable(
  "training_job_to_image",
  {
    imageId: integer("imageId").notNull(),
    trainingJobId: integer("trainingJobId").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.imageId, t.trainingJobId] }),
  }),
);

export const trainingJobsToImagesRelations = relations(
  trainingJobsToImages,
  ({ one }) => ({
    image: one(images, {
      fields: [trainingJobsToImages.imageId],
      references: [images.id],
    }),
    trainingJob: one(trainingJobs, {
      fields: [trainingJobsToImages.trainingJobId],
      references: [trainingJobs.id],
    }),
  }),
);

// insert schema

export const insertImageStoreSchema = createInsertSchema(imageStores);
