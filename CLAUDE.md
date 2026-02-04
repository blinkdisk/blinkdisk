# BlinkDisk Agent Instructions

BlinkDisk is a minimalistic and user-friendly desktop application that makes file backups accessible to everyone.

## Key features

- Modern, Minimalistic & User-Friendly
- Cross-Platform (Windows, Mac and Linux)
- Based on Kopia (an open-source backup tool)
- End-To-End-Encrypted
- Open-Source

## Pricing model

Users can pick between these two options:

- BlinkDisk Cloud: Our managed cloud storage with a free tier and affordable subscription plans.
- Custom Storage: Use your own storage for 100% free (supports a wide variants of options)

- We have a managed model called "BlinkDisk Cloud" that offers an affordable solution with no setup required.
- I also offer a bring-your-own-keys model where people can enter their own cloud credentials and use the desktop app for completely free, but this requires more knowledge and time to setup.

## Commands

```bash
pnpm lint                       # Lint all projects
pnpm typecheck                  # Check typescript types of all project
```

This project uses Turborepo which relies on pnpm workspaces, so you can filter for projects by running commands like:

```bash
pnpm --filter=api lint
```

## Project Structure

### Applications (apps/)

- **core** - The core "engine" for handling the backups, forked from the Kopia project.
- **api** - Hono + tRPC backend used for syncing configuration with a user's account.
- **cloud** - Cloudflare Workers + Durable Object project for our optional managed cloud storage solution.
- **desktop** - React + Tanstack Router frontend for the desktop app UI.
- **electron** - Electron backend (main process) for the desktop app.
- **marketing** - Astro marketing site.

### Shared Libraries (libs/)

- **config** - Some configuration constants
- **db** - Kysely ORM setup and prisma schema
- **ui** - Shared react components
- **schemas** - Zod validation schemas
- **utils** - Shared utility functions
- **hooks** - Shared React hooks library
- **emails** - Email templates using React Email

### Workspace Imports

These path aliases are configured:

- @ui/_: ./libs/ui/src/_
- @api/_: ./apps/api/src/_
- @marketing/_: ./apps/marketing/src/_
- @styles/_: ./libs/styles/_
- @utils/_: ./libs/utils/src/_
- @desktop/_: ./apps/desktop/src/_
- @hooks/_: ./libs/hooks/src/_
- @db/_: ./libs/db/src/_
- @emails/_: ./libs/emails/src/_
- @schemas/_: ./libs/schemas/src/_
- @config/_: ./libs/config/src/_
- @electron/_: ./apps/electron/src/_
- @cloud/_: ./apps/cloud/src/_

## Code Style

- **Typescript**: Always use `type` not `interface`
- **Imports**: Use path aliases (see available aliases above) for imports
- **Comments**: Only write comments if the code is not self-explanatory
