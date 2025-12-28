import "dotenv/config"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

// Main users DB
const usersSqlite = new Database("users.db")
usersSqlite.run(`
  CREATE TABLE IF NOT EXISTS users (
    username text PRIMARY KEY,
    password text NOT NULL
  )
`)
export const usersDb = drizzle(usersSqlite)

// Dynamic DB for each user
export function getDb(username: string) {
    const sqlite = new Database(`wish_${username}.db`)
    sqlite.run(`
    CREATE TABLE IF NOT EXISTS wishes (
      id integer PRIMARY KEY AUTOINCREMENT,
      item text NOT NULL,
      fulfilled integer NOT NULL DEFAULT 0,
      created_at integer NOT NULL
    )
  `)
    return drizzle(sqlite)
}
