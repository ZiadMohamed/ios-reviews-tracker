# iOS Reviews Tracker

Hey! Thanks for taking the time to look at this..

## Running locally

Requires Node 22+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

That starts both the server (port `3001`) and the client (port `5173`) in parallel. Open http://localhost:5173 and you're in.

A few other scripts that might be useful:

```bash
pnpm test         # run all tests (client + server)
pnpm typecheck    # type-check everything
pnpm lint         # eslint
pnpm dev:server   # server only
pnpm dev:client   # client only
```

## Project structure

It's a pnpm monorepo with two apps and a tiny shared package. I went with this layout for simplicity as it lets you run everything from the root with one command.

```
apps/
  client/   React + Vite + Tailwind + shadcn
  server/   Express + a small in-memory store
packages/
  types/    Shared TS types
```

## Backend

The Express server boots up and immediately kicks off a **poller** (`apps/server/src/poller.ts`). On start it polls each tracked app's RSS feed once, then re-polls every `POLL_INTERVAL_MS`. Reviews are normalized into a `Review` shape and written to an in-memory store that gets persisted to a JSON file on disk (`apps/server/src/reviews.json`).

A few details worth knowing:

- **Sequential polling between apps** with a small delay, just to be polite to Apple's RSS endpoint and be defensive against potential rate limiting.
- **Soft delete** When a review drops out of the 48h window or disappears from the feed, we stamp `deletedAt` instead of removing it.
- **Per-page retry** (`fetchWithRetry`): If a page fails, we retry once. If any of the pages fail, we don't soft-delete; better to keep stale data than to wipe rows because of a network issue.

### How I'd scale this

I tried to follow the KISS principle for this take-home test. If we were to scale this, I'd consider:

- **Event-driven architecture** for in-app changes, e.g. publish a `review.created` / `review.updated` event when the poller picks up something new via SSE or WebSockets and Redis depending on the stack
- **Cron jobs (or a managed scheduler)** to trigger the Apple RSS pull, instead of `setInterval` inside the web process. That decouples polling from the request-serving process, lets you scale them independently, and means a server restart doesn't reset the poll cycle.
- **Use a real database** obviously, duhhh..

## Frontend

React + Vite, with **shadcn/ui** for components and Tailwind for styling. I picked shadcn to test it out. I'm more familiar with MUI from past projects but read shadcn is gaining popularity.

Data fetching is done with **TanStack Query**. I know it's a bit extra for an app this small.
A `useEffect` + `useState` would technically work for fetching apps and reviews. But it's only a few extra lines, gives me caching, refetch-on-focus, request dedup, and loading/error states for free, and the code reads better.

That's the tour. Happy to chat about any of it, thank you for reading!
