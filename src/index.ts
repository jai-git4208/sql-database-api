import { Hono } from "hono"
import { createWish, deleteWish, fulfillWish, listWishes, createUser, getUser } from "./db/queries"
import { basicAuth } from "hono/basic-auth"
import { cors } from "hono/cors"

const app = new Hono<{ Variables: { user: string } }>()

app.use("/*", cors())

// Custom Basic Auth Middleware
app.use("/*", async (c, next) => {
  // Public routes
  if (c.req.path === "/register" && c.req.method === "POST") {
    return next()
  }

  const auth = basicAuth({
    verifyUser: async (username, password) => {
      // 1. Check Admin
      if (username === "jai" && password === "jailovesavi") {
        return true
      }

      // 2. Check Database Users
      const user = getUser(username)
      if (user && user.password === password) {
        return true
      }

      return false
    },
  })

  // We need to extract username manually to set contexts because verifyUser is boolean-retURNING
  // But Hono's basicAuth middleware doesn't easily expose the authenticated user in context unless we parse headers again or use a custom implementation.
  // Actually, let's just parse the header to set the user context, then run basicAuth validation.

  const authHeader = c.req.header("Authorization")
  if (authHeader) {
    const match = authHeader.match(/^Basic\s+(.*)$/)
    if (match) {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8')
      const [user] = decoded.split(':')
      c.set("user", user)
    }
  }

  return auth(c, next)
})

app.get("/", (c) => c.text("Beans!"))

// POST register
app.post("/register", async (c) => {
  const body = await c.req.json().catch(() => null)
  const username = (body?.username ?? "").toString().trim()
  const password = (body?.password ?? "").toString().trim()

  if (!username || !password) return c.json({ error: "missing username or password" }, 400)

  try {
    createUser(username, password)
    // Also create the user's wish db file immediately or let it be created lazy on first request?
    // Lazy is fine (getDb handles new Database creation).
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ error: "username likely taken" }, 409)
  }
})

// GET all wishes
app.get("/api/wishes", (c) => {
  const user = c.get("user")
  return c.json(listWishes(user))
})

// POST a new wish
app.post("/api/wishes", async (c) => {
  const user = c.get("user")
  const body = await c.req.json().catch(() => null)
  const item = (body?.item ?? "").toString().trim()

  if (!item) return c.json({ error: "item is required" }, 400)

  return c.json(createWish(user, item), 201)
})

// PATCH (update) a wish
app.patch("/api/wishes/:id/fulfill", (c) => {
  const user = c.get("user")
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = fulfillWish(user, id)
  if (!res) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

// DELETE a wish
app.delete("/api/wishes/:id", (c) => {
  const user = c.get("user")
  const id = Number(c.req.param("id"))
  if (!Number.isFinite(id)) return c.json({ error: "bad id" }, 400)

  const res = deleteWish(user, id)
  if (!res) return c.json({ error: "not found" }, 404)

  return c.json({ ok: true })
})

const port = Number(process.env.PORT) || 3000

console.log(`Server is running on port ${port} `)

export default {
  port,
  fetch: app.fetch,
}
