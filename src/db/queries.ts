import { db } from "./index"
import { wishes } from "./schema" 
import { eq, desc } from "drizzle-orm"

export function listWishes() {
  return db.select().from(wishes).orderBy(desc(wishes.id)).all()
}

export function createWish(item: string) {
  const createdAt = Math.floor(Date.now() / 1000)

  const res = db.insert(wishes).values({
    item,
    fulfilled: 0,
    createdAt,
  }).returning({ id: wishes.id }).get()

  return res
}

export function fulfillWish(id: number) {
  const res = db.update(wishes)
    .set({ fulfilled: 1 })
    .where(eq(wishes.id, id))
    .returning({ id: wishes.id })
    .get()

  return res
}

export function deleteWish(id: number) {
  const res = db.delete(wishes)
    .where(eq(wishes.id, id))
    .returning({ id: wishes.id })
    .get()
    
  return res
}
