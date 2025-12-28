import { getSqlite, usersDb } from "./index"
import { users } from "./schema"
import { eq } from "drizzle-orm"

export function executeSql(username: string, query: string, params: any[] = []) {
  const db = getSqlite(username)
  return db.prepare(query).run(...params)
}

export function executeSqlRead(username: string, query: string, params: any[] = []) {
  const db = getSqlite(username)
  return db.prepare(query).all(...params)
}

export function listTables(username: string) {
  const db = getSqlite(username)
  return db.query("SELECT name FROM sqlite_master WHERE type='table'").all()
}

export function createUser(username: string, password: string) {
  return usersDb.insert(users).values({ username, password }).run()
}

export function getUser(username: string) {
  return usersDb.select().from(users).where(eq(users.username, username)).get()
}
