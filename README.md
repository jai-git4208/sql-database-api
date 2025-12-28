# Haxmas Generic Database Service

A multi-tenant "SQLite-as-a-Service". Users can register, log in, and execute arbitrary SQL queries against their own private SQLite database.

## Installation

```sh
bun install
```

## Running the Server

```sh
bun run dev
```

Open http://localhost:3000 to use the web interface.

## Features

- **Multi-Tenancy**: Each user gets their own isolated `wish_[username].db` file.
- **Generic SQL Execution**: Run `SELECT`, `INSERT`, `CREATE TABLE`, etc.
- **Frontend UI**: A built-in SQL runner and result viewer.

## API Reference

The API uses Basic Authentication.

### 1. Register User
**POST** `/register`
```json
{ "username": "bob", "password": "bob" }
```

### 2. Execute SQL
**POST** `/api/query`
Header: `Authorization: Basic <base64 credentials>`
Body:
```json
{
  "query": "SELECT * FROM my_table WHERE id = ?",
  "params": [1]
}
```

### 3. List Tables
**GET** `/api/tables`
Header: `Authorization: Basic <base64 credentials>`

## Example Usage (curl)

### Register
```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"bob", "password":"bob"}' http://localhost:3000/register
```

### Create a Table
```bash
curl -u bob:bob -X POST -H "Content-Type: application/json" \
  -d '{"query":"CREATE TABLE todos (id INTEGER PRIMARY KEY, task TEXT)"}' \
  http://localhost:3000/api/query
```

### Insert Data
```bash
curl -u bob:bob -X POST -H "Content-Type: application/json" \
  -d '{"query":"INSERT INTO todos (task) VALUES (?)", "params":["Buy milk"]}' \
  http://localhost:3000/api/query
```

### Query Data
```bash
curl -u bob:bob -X POST -H "Content-Type: application/json" \
  -d '{"query":"SELECT * FROM todos"}' \
  http://localhost:3000/api/query
```
