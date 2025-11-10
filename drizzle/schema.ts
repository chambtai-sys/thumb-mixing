import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const thumbnails = mysqlTable("thumbnails", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).default("image/jpeg").notNull(),
  fileSize: int("fileSize").notNull(),
  width: int("width"),
  height: int("height"),
  analysis: text("analysis"), // JSON string with color, text, composition analysis
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Thumbnail = typeof thumbnails.$inferSelect;
export type InsertThumbnail = typeof thumbnails.$inferInsert;

export const mixes = mysqlTable("mixes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sourceThumbIds: text("sourceThumbIds").notNull(), // JSON array of thumbnail IDs
  resultFileKey: varchar("resultFileKey", { length: 255 }),
  resultFileUrl: text("resultFileUrl"),
  blendingMethod: varchar("blendingMethod", { length: 100 }).default("smart").notNull(),
  ragSuggestions: text("ragSuggestions"), // JSON string with LLM suggestions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mix = typeof mixes.$inferSelect;
export type InsertMix = typeof mixes.$inferInsert;

export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  thumbnailId: int("thumbnailId").notNull().references(() => thumbnails.id),
  dominantColors: text("dominantColors"), // JSON array of hex colors
  textElements: text("textElements"), // JSON array with text content and position
  composition: text("composition"), // JSON with layout analysis
  engagementScore: int("engagementScore"),
  suggestions: text("suggestions"), // JSON with improvement suggestions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;