import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

// "wishes" is the table name in the DB
export const wishes = sqliteTable("wishes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  item: text("item").notNull(),
  fulfilled: integer("fulfilled").notNull().default(0),
  createdAt: integer("created_at").notNull(),
})