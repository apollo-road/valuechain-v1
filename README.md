# EnergyMargin

EnergyMargin is a minimal freelancer-focused margin tracker built with Next.js 14 + Prisma + PostgreSQL.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS (dark mode default)
- React Flow (horizontal value chain)

## Features
- Email-only authentication (single-tenant friendly)
- Dashboard with project list + create project (name + revenue)
- Project detail page with value-chain graph and per-activity margin metrics
- Direct cost item tracking on each activity
- Overhead settings with allocation bases (`revenue` or `equal`)
- Automatic overhead allocation across projects
- Margin summary with project bars and lowest-margin highlight in red
- Decision engine utility: `evaluateProject(projectData)`
- Seeded demo freelancer data

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and set your PostgreSQL connection
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client
   ```bash
   npm run prisma:generate
   ```
4. Run migration
   ```bash
   npm run prisma:migrate
   ```
5. Seed demo data
   ```bash
   npm run prisma:seed
   ```
6. Start dev server
   ```bash
   npm run dev
   ```

Open http://localhost:3000.

Use `freelancer@energymargin.dev` (or any email) to sign in.

## Accounting logic notes
- Project direct cost = sum of all activity cost items.
- Overhead allocation applies each pool to every project:
  - `equal`: split evenly
  - `revenue`: weighted by revenue share
- Activity-level overhead is split by activity direct-cost share.
- Node glow colors:
  - green when margin > 30%
  - red when margin < 15%
