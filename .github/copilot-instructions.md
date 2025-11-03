# Pathfinity - AI Coding Assistant Instructions

## Project Overview
Pathfinity is a Next.js 16 university course assistant with AI-powered semantic search, featuring OAuth account linking and an interactive academic roadmap. Built with React Server Components, Better Auth, Drizzle ORM, and OpenAI embeddings.

## Architecture

### Authentication System (Better Auth)
- **Automatic Account Linking**: OAuth users are automatically linked to email accounts via email matching (see `lib/auth.ts` lines 48-105)
- **Auto-generated Passwords**: OAuth users receive secure passwords stored in user table for dual authentication
- **Client/Server Split**: 
  - Client hooks: `lib/auth-client.ts` (useSession, signIn, signOut)
  - Server functions: `lib/auth-server.ts` (getSession with headers)
- **Session Protection**: All routes under `app/(with-sidebar)/` require authentication (enforced in layout)

### Database Schema (PostgreSQL + Drizzle)
- **Auth Tables**: users, sessions, accounts, verifications (Better Auth schema)
- **RAG Tables**: 
  - `sources`: Track data origins (JSON files, APIs)
  - `embeddings`: 1536-dim vectors with `ivfflat` index for cosine similarity search
  - Stores full metadata as JSONB, with flattened fields (courseCode, title, campus)
- **Schema Location**: `app/db/schema.ts` (NOT in root `/db`)
- **Migration Commands**: 
  - Generate: `npx drizzle-kit generate`
  - Push (dev): `npx drizzle-kit push`

### AI Chat System
- **API Route**: `app/api/chat/route.ts` - Implements 3 tools:
  1. `getCourseByCode`: Exact course code lookup (use for specific codes)
  2. `listCourses`: Browse courses with dept/campus filters (call ONCE per response)
  3. `searchKnowledgeBase`: Semantic search for topics/keywords
- **UI Components**: 
  - `app/(with-sidebar)/Home/page.tsx` - Main chat interface using `useChat` hook
  - `app/components/chat/conversation.tsx` - Message display
  - `app/components/ai-elements/` - 30+ reusable AI UI components
- **System Prompt**: Located in `route.ts` POST handler (lines 273-310) - defines tool selection logic

### Semantic Search Pipeline
1. **Ingestion**: `scripts/ingest/ingest-json.ts` - Batch embeds course data (OpenAI text-embedding-3-small)
2. **Search**: `lib/semantic-search.tsx` - Cosine similarity query with threshold 0.3, returns top 5
3. **Embeddings**: `lib/embeddings.ts` - Wrapper for `ai` SDK embed/embedMany functions

## Development Workflows

### Environment Setup
Required variables in `.env` (no `.env.local` or `.env.example` exists):
```bash
DATABASE_URL=postgresql://...          # Neon PostgreSQL
BETTER_AUTH_SECRET=<random-32-bytes>
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=<oauth-app-id>
GITHUB_CLIENT_SECRET=<oauth-secret>
GOOGLE_CLIENT_ID=<oauth-app-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
OPENAI_API_KEY=<for-embeddings-and-chat>
```

### Running the App
- **Dev**: `npm run dev` (Next.js on port 3000)
- **Build**: `npm run build` && `npm start`
- **Lint**: `npm run lint` (ESLint)
- **Cleanup**: `npm run cleanup-duplicates` (runs `tsx scripts/run-cleanup.ts`)

### Database Workflows
1. Modify schema in `app/db/schema.ts`
2. Run `npx drizzle-kit push` for direct schema push (no migrations)
3. For production: Use `npx drizzle-kit generate` → `npx drizzle-kit migrate`

### Adding Course Data
1. Place JSON in `app/db/data/`
2. Run ingestion script via `tsx scripts/ingest/ingest-json.ts`
3. Script handles deduplication via content hashing

## Project-Specific Conventions

### Import Aliases (tsconfig.json)
- `@/*` → Root level (e.g., `@/app/db`, `@/lib/auth`)
- Components: `@/app/components/ui` (shadcn), `@/app/components/chat`, `@/app/components/ai-elements`

### File Organization
- **App Router**: All pages in `app/` directory
- **Protected Routes**: Use `(with-sidebar)` route group with layout authentication
- **API Routes**: `app/api/` - auth handlers and chat endpoint
- **Database**: `app/db/` (NOT root `/db`)
- **Scripts**: `scripts/` for utilities (ingestion, cleanup)

### UI Components (shadcn/ui)
- Config: `components.json` (New York style, RSC enabled, Lucide icons)
- Aliases: Components at `@/components` but actual location is `app/components/ui`
- Add components: `npx shadcn@latest add <component-name>`
- Custom theme: Uses CSS variables, neutral base color, defined in `app/globals.css`

### Styling
- **Tailwind CSS 4**: PostCSS setup in `postcss.config.mjs`
- **Module CSS**: Used for specialized components (e.g., `roadmap.module.css` with UH Manoa theme)
- **CSS Variables**: Theme colors in `globals.css` for shadcn components

## Key Integration Points

### Better Auth Events
- `user.created` event in `lib/auth.ts` handles OAuth account linking
- Checks for existing email, migrates accounts/sessions to existing user
- Generates password for OAuth users without one

### AI SDK Integration
- Uses Vercel AI SDK (`ai` package) for streaming and tools
- `useChat` hook: Client-side streaming with message state
- `streamText`: Server-side tool execution with `stopWhen(stepCountIs(2))`
- Tool results returned as structured objects to client

### React Flow (Roadmap)
- `app/(with-sidebar)/Roadmap/page.tsx` - Interactive drag-drop academic planner
- Uses `@xyflow/react` with custom node types and UH Manoa green theme
- Local state management (no persistence to DB yet)

## Common Patterns

### Authentication Checks
```typescript
// Server Components
import { getSession } from "@/lib/auth-server";
const session = await getSession();
if (!session) redirect("/login");

// Client Components
import { useSession } from "@/lib/auth-client";
const { data: session, isPending } = useSession();
```

### Database Queries with Drizzle
```typescript
import { db } from "@/app/db";
import { embedding as e } from "@/app/db/schema";
import { sql } from "drizzle-orm";

// Use raw SQL for complex queries (e.g., JSONB operations)
const results = await db.select().from(e)
  .where(sql`${e.metadata}->>'field' ILIKE ${pattern}`);
```

### AI Tool Implementation
- Tools defined in `app/api/chat/route.ts` with Zod schemas
- Execute function receives parsed input, returns string/formatted text
- System prompt guides tool selection - update prompt for behavior changes

## Documentation References
- Authentication setup: `AUTH_SETUP.md`
- Email auth details: `EMAIL_AUTH_README.md`
- Roadmap features: `ROADMAP_DOCUMENTATION.md`

## Critical Notes
- Database schema is in `app/db/schema.ts`, NOT root `db/schema.ts`
- Always use `getSession()` from `lib/auth-server.ts` for server-side auth (requires `await headers()`)
- When modifying chat tools, update system prompt to reflect new tool selection logic
- Semantic search threshold (0.3) and limit (5) hardcoded in `lib/semantic-search.tsx`
- Better Auth account linking happens automatically via `user.created` event - no manual intervention needed
