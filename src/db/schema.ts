import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const prompts = pgTable(
  "prompts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    titleEn: varchar("title_en", { length: 160 }).notNull(),
    description: text("description").notNull(),
    descriptionEn: text("description_en").notNull(),
    content: text("content").notNull(),
    contentEn: text("content_en").notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    model: varchar("model", { length: 80 }).notNull().default("Universale"),
    featured: boolean("featured").notNull().default(false),
    uses: integer("uses").notNull().default(0),
    /** curated | community | learned */
    source: varchar("source", { length: 30 }).notNull().default("curated"),
    /** both | en | it — languages the content is actually written in */
    lang: varchar("lang", { length: 5 }).notNull().default("both"),
    contributor: varchar("contributor", { length: 120 }),
    sourceUrl: text("source_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("prompts_category_idx").on(table.category),
    index("prompts_featured_idx").on(table.featured),
    index("prompts_source_idx").on(table.source),
  ],
);

export const generations = pgTable(
  "generations",
  {
    id: serial("id").primaryKey(),
    goal: text("goal").notNull(),
    result: text("result").notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    tone: varchar("tone", { length: 60 }).notNull(),
    language: varchar("language", { length: 5 }).notNull().default("it"),
    detailLevel: varchar("detail_level", { length: 30 }).notNull().default("balanced"),
    targetModel: varchar("target_model", { length: 40 }).notNull().default("universal"),
    mode: varchar("mode", { length: 20 }).notNull().default("create"),
    score: integer("score").notNull().default(0),
    favorite: boolean("favorite").notNull().default(false),
    learned: boolean("learned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("generations_created_idx").on(table.createdAt), index("generations_favorite_idx").on(table.favorite)],
);

export type PromptRecord = typeof prompts.$inferSelect;
export type GenerationRecord = typeof generations.$inferSelect;
