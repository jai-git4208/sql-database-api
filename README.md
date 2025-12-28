# Haxmas Wish List

A multi-user wish list application.

## Installation

```sh
bun install
```

## Running the Server

```sh
bun run dev
```

Open http://localhost:3000 to use the web interface.

## API Usage

The API supports Basic Authentication. User accounts are isolated; each user sees only their own wishes.

### Register
```sh
curl -X POST -H "Content-Type: application/json" -d '{"username":"bob", "password":"bob"}' http://localhost:3000/register
```

### Admin Access
The root admin `jai` has access to their own database (and in this implementation, currently shares the 'admin' scope logic, though data separation is per-username).

```sh
curl -u jai:jailovesavi http://localhost:3000/api/wishes
```

### User Access
```sh
curl -u bob:bob http://localhost:3000/api/wishes
```
