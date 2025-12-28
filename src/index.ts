import { Hono } from "hono"
import { createWish, deleteWish, fulfillWish, listWishes } from "./db/queries"

const app = new Hono()

app.get("/", (c) => c.text("Beans!"))

// GET all wishes
app.get("/api/wishes", (c) => c.json(listWishes()))

// POST a new wish
app.post("/api/wishes", async (c) => {
  const body = await c.req.json().catch(() => null)
  // "item" matches the column name in our schema
  const item = (body?.item ?? "").toString().trim() 
  
  if (!item) return c.json({ error: "item is required" }, 400)

  return c.json(createWish(item), 201)
})

// PATCH (update) a wish
app.patch("/api/wishes/:id/fulfill", (c) => {
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = fulfillWish(id)
  if (!res) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

// DELETE a wish
app.delete("/api/wishes/:id", (c) => {
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = deleteWish(id)
  if (!res) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

const port = Number(process.env.PORT) || 3000

console.log(`Server is running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}