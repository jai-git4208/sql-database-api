import { getDb, usersDb } from "./index"
import { wishes, users } from "./schema"
import { eq, desc } from "drizzle-orm"

export function listWishes(username: string) {
  return getDb(username).select().from(wishes).orderBy(desc(wishes.id)).all()
}

export function createWish(username: string, item: string) {
  const createdAt = Math.floor(Date.now() / 1000)

  const res = getDb(username).insert(wishes).values({
    item,
    fulfilled: 0,
    createdAt,
  }).returning({ id: wishes.id }).get()

  return res
}

export function fulfillWish(username: string, id: number) {
  const res = getDb(username).update(wishes)
    .set({ fulfilled: 1 })
    .where(eq(wishes.id, id))
    .returning({ id: wishes.id })
    .get()

  return res
}

export function deleteWish(username: string, id: number) {
  const res = getDb(username).delete(wishes)
    .where(eq(wishes.id, id))
    .returning({ id: wishes.id })
    .get()

  return res
}

export function createUser(username: string, password: string) {
  return usersDb.insert(users).values({ username, password }).run()
}

export function getUser(username: string) {
  return usersDb.select().from(users).where(eq(users.username, username)).get()
}
