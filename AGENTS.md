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

- CloudBlink: Our managed cloud storage with a free tier and affordable subscription plans.
- Custom Storage: Use your own storage for 100% free (supports many storage options).

- CloudBlink offers an affordable managed solution with no setup required.
- The bring-your-own-keys model lets people enter their own cloud credentials and use the desktop app for free, but it requires more knowledge and time to set up.

## Commands

```bash
pnpm typecheck                  # Check if typescript types are valid
pnpm test                       # Run all test suites
pnpm lint                       # Run biome to check linting and formatting
pnpm format                     # Automatically format all files with biome 
pnpm unused                     # Run knip to find dead code
```

## Project Structure

### Applications (apps/)

- **core** - The core "engine" for handling the backups, forked from the Kopia project.
- **api** - Hono + tRPC backend used for syncing configuration with a user's account.
- **cloud** - Cloudflare Workers + Durable Object project for our optional managed cloud storage solution.
- **desktop** - React + TanStack Router frontend for the desktop app UI.
- **electron** - Electron backend (main process) for the desktop app.
- **marketing** - Astro marketing site.
- **web** - Vite web app.

### Shared Libraries (libs/)

- **assets** - Shared static assets.
- **biome** - Shared Biome configuration package.
- **components** - Shared React app components.
- **constants** - Shared constants.
- **db** - Drizzle ORM schema and database tooling.
- **emails** - Email templates using React Email.
- **forms** - Shared form components and helpers.
- **hooks** - Shared React hooks.
- **schemas** - Zod validation schemas
- **styles** - Shared Tailwind/CSS styles.
- **typescript** - Shared TypeScript configuration.
- **ui** - Shared React UI primitives.
- **utils** - Shared utility functions

## Code Style

- **Typescript**: Always use `type` not `interface`
- **Imports**: Use path aliases (see available aliases above) for imports
- **Comments**: Only write comments if the code is not self-explanatory
