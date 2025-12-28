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
export function getSqlite(username: string) {
  return new Database(`wish_${username}.db`)
}

export function getDb(username: string) {
  const sqlite = getSqlite(username)
  return drizzle(sqlite)
}
