import { pgTable, index, unique, pgEnum, varchar, boolean, timestamp, foreignKey, jsonb, primaryKey, text, integer } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const role = pgEnum("role", ['admin', 'member'])


export const vihubWorkspace = pgTable("vihub_workspace", {
	id: varchar("id").primaryKey().notNull(),
	name: varchar("name").notNull(),
	personal: boolean("personal").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => {
	return {
		workspaceCreatedAtIdx: index("workspace_createdAt_idx").on(table.createdAt),
		vihubWorkspaceNameUnique: unique("vihub_workspace_name_unique").on(table.name),
	}
});

export const vihubUser = pgTable("vihub_user", {
	id: varchar("id").primaryKey().notNull(),
	name: varchar("name"),
	email: varchar("email").notNull(),
	emailVerified: timestamp("emailVerified", { mode: 'string' }).defaultNow(),
	image: varchar("image"),
	apiKey: varchar("apiKey"),
});

export const vihubSession = pgTable("vihub_session", {
	sessionToken: varchar("sessionToken").primaryKey().notNull(),
	userId: varchar("userId").notNull().references(() => vihubUser.id),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		sessionUserIdIdx: index("session_userId_idx").on(table.userId),
	}
});

export const vihubImage = pgTable("vihub_image", {
	id: varchar("id").primaryKey().notNull(),
	url: varchar("url").notNull(),
	downloadUrl: varchar("downloadUrl").notNull(),
	pathname: varchar("pathname").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	imageStoreId: varchar("imageStoreId").notNull(),
	aiLabelId: varchar("aiLabelId"),
	humanLabelId: varchar("humanLabelId"),
},
(table) => {
	return {
		imageCreatedAtIdx: index("image_createdAt_idx").on(table.createdAt),
		vihubImageUrlUnique: unique("vihub_image_url_unique").on(table.url),
		vihubImageDownloadUrlUnique: unique("vihub_image_downloadUrl_unique").on(table.downloadUrl),
		vihubImagePathnameUnique: unique("vihub_image_pathname_unique").on(table.pathname),
	}
});

export const vihubImageStore = pgTable("vihub_image_store", {
	id: varchar("id").primaryKey().notNull(),
	name: varchar("name").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	thumbnailId: varchar("thumbnailId"),
	workspaceId: varchar("workspaceId").notNull(),
},
(table) => {
	return {
		imageStoreCreatedAtIdx: index("image_store_createdAt_idx").on(table.createdAt),
	}
});

export const vihubLabelClass = pgTable("vihub_label_class", {
	id: varchar("id").primaryKey().notNull(),
	key: varchar("key").notNull(),
	displayName: varchar("displayName").notNull(),
	imageStoreId: varchar("imageStoreId").notNull(),
});

export const vihubLabel = pgTable("vihub_label", {
	id: varchar("id").primaryKey().notNull(),
	detail: jsonb("detail"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	imageId: varchar("imageId").notNull(),
	labelClassId: varchar("labelClassId").notNull(),
});

export const vihubUsersToWorkspaces = pgTable("vihub_users_to_workspaces", {
	userId: varchar("userId").notNull().references(() => vihubUser.id),
	workspaceId: varchar("workspaceId").notNull().references(() => vihubWorkspace.id),
	role: role("role"),
},
(table) => {
	return {
		userWorkspaceUserIdIdx: index("user_workspace_userId_idx").on(table.userId),
		userWorkspaceWorkspaceIdIdx: index("user_workspace_workspaceId_idx").on(table.workspaceId),
		vihubUsersToWorkspacesUserIdWorkspaceIdPk: primaryKey({ columns: [table.userId, table.workspaceId], name: "vihub_users_to_workspaces_userId_workspaceId_pk"})
	}
});

export const vihubVerificationToken = pgTable("vihub_verificationToken", {
	identifier: varchar("identifier").notNull(),
	token: varchar("token").notNull(),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		vihubVerificationTokenIdentifierTokenPk: primaryKey({ columns: [table.identifier, table.token], name: "vihub_verificationToken_identifier_token_pk"})
	}
});

export const vihubAccount = pgTable("vihub_account", {
	userId: varchar("userId").notNull().references(() => vihubUser.id),
	type: varchar("type").notNull(),
	provider: varchar("provider").notNull(),
	providerAccountId: varchar("providerAccountId").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: varchar("token_type"),
	scope: varchar("scope"),
	idToken: text("id_token"),
	sessionState: varchar("session_state"),
},
(table) => {
	return {
		accountUserIdIdx: index("account_userId_idx").on(table.userId),
		vihubAccountProviderProviderAccountIdPk: primaryKey({ columns: [table.provider, table.providerAccountId], name: "vihub_account_provider_providerAccountId_pk"})
	}
});