import { Hono } from "hono"
import { executeSql, executeSqlRead, listTables, createUser, getUser } from "./db/queries"
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

app.get("/", async (c) => {
  return c.html(await Bun.file("public/index.html").text())
})

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

// GET tables
app.get("/api/tables", (c) => {
  const user = c.get("user")
  return c.json(listTables(user))
})

// POST query
app.post("/api/query", async (c) => {
  const user = c.get("user")
  const body = await c.req.json().catch(() => null)
  const query = (body?.query ?? "").toString().trim()
  const params = body?.params ?? []

  if (!query) return c.json({ error: "query is required" }, 400)

  try {
    const isSelect = /^\s*SELECT/i.test(query)
    let res
    if (isSelect) {
      res = executeSqlRead(user, query, params)
    } else {
      res = executeSql(user, query, params)
    }
    return c.json(res)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

const port = Number(process.env.PORT) || 3000

console.log(`Server is running on port ${port} `)

export default {
  port,
  fetch: app.fetch,
}
