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
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `vihub_${name}`);

export const users = createTable("user", {
  id: varchar("id").notNull().primaryKey(),
  name: varchar("name"),
  email: varchar("email").notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image"),
  apiKey: varchar("apiKey"),
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
    userId: varchar("userId")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
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

export const roleEnum = pgEnum("role", ["member", "admin"]);

export const usersToWorkspaces = createTable(
  "users_to_workspaces",
  {
    userId: varchar("userId")
      .notNull()
      .references(() => users.id),
    workspaceId: integer("workspaceId")
      .notNull()
      .references(() => workspaces.id),
    role: roleEnum("role").default("member").notNull(),
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
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),

    thumbnailId: integer("thumbnailId"),
    workspaceId: integer("workspaceId").notNull(),
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
  thumbnail: one(images, {
    fields: [imageStores.thumbnailId],
    references: [images.id],
  }),
  images: many(images),
  labelClasses: many(labelClasses),
}));

export const labelClasses = createTable("label_class", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull(),
  displayName: varchar("displayName").notNull(),

  imageStoreId: integer("imageStoreId").notNull(),
});

export const labelClassesRelations = relations(
  labelClasses,
  ({ one, many }) => ({
    imageStore: one(imageStores, {
      fields: [labelClasses.imageStoreId],
      references: [imageStores.id],
    }),
    labels: many(labels),
  }),
);

export const images = createTable(
  "image",
  {
    id: serial("id").primaryKey(),
    url: varchar("url").notNull().unique(),
    downloadUrl: varchar("downloadUrl").notNull().unique(),
    // pathname: varchar("pathname").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdAtDate: date("created_at_date").defaultNow().notNull(),
    // createdAtDateString: varchar("created_at_date_string").notNull(),
    imageStoreId: integer("imageStoreId").notNull(),
    aiLabelId: integer("aiLabelId"),
    humanLabelId: integer("humanLabelId"),
  },
  (t) => ({
    createdAtIdx: index("image_createdAt_idx").on(t.createdAt),
  }),
);

export const imagesRelations = relations(images, ({ one }) => ({
  imageStore: one(imageStores, {
    fields: [images.imageStoreId],
    references: [imageStores.id],
  }),
  aiLabel: one(labels, {
    fields: [images.aiLabelId],
    references: [labels.id],
  }),
  humanLabel: one(labels, {
    fields: [images.humanLabelId],
    references: [labels.id],
  }),
}));

export const labels = createTable("label", {
  id: serial("id").primaryKey(),
  detail: jsonb("detail"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  imageId: integer("imageId").notNull(),
  labelClassId: integer("labelClassId").notNull(),
});

export const labelsRelations = relations(labels, ({ one }) => ({
  image: one(images, {
    fields: [labels.imageId],
    references: [images.id],
  }),
  labelClass: one(labelClasses, {
    fields: [labels.labelClassId],
    references: [labelClasses.id],
  }),
}));
