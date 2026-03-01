<p align="center">
  <h1 align="center">artha</h1>
  <p align="center"><strong>your financial story, told forward</strong></p>
</p>

<p align="center">
  Credit Karma tells you <em>what you spent</em>. artha tells you <strong>who you're becoming</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI-GPT--4o%20%2B%20Realtime-412991?logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/DB-Neon%20PostgreSQL-00E599?logo=postgresql" alt="Neon" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel" />
</p>

---

## What is artha?

artha is an AI-powered financial wellness app built for young adults who want to build financial confidence but don't know where to start.

Most fintech apps — Credit Karma, Rocket Money, Mint — dump bank data into dashboards, charts, and tables. That works if you're already financially literate. But if you can read a chart and draw conclusions from it, you probably don't need the app in the first place.

artha takes a different approach. It connects to your bank via Plaid, detects invisible behavioral patterns in your spending, and delivers **personalized, bite-sized insights** through UX patterns Gen Z already knows — swipe cards like Tinder, scrollable stories like Instagram. No dashboards. No pie charts. Just your financial story, told in a way you'll actually read.

The innovation isn't displaying bank data. It's going one step further: **proactively surfacing nudges, behavioral patterns, and actionable goals** — then keeping you in the loop through an AI coach and the messaging channels you already use.

---

## Innovation Pillars

| Pillar | What it does |
|---|---|
| **Behavioral Fingerprinting** | Detects 7+ spending patterns invisible to users (Sunday night ordering, payday splurges, subscription creep, etc.) |
| **Consequence Visualization** | Calculates the compound effect of small changes from your current age to retirement (65) |
| **Proactive AI Coach** | GPT-4o-powered guidance via text and OpenAI Realtime voice — meets users where they are |
| **Story-First UX** | Swipeable insight cards (Tinder) and scrollable stories (Instagram) — bite-sized for the shrinking attention spans of young adults |
| **Engagement Layer** | Streaks, challenges, agent nudges, and daily coaching — Duolingo for finance |
| **Animated Landing** | Spending DNA reveal creates an instant "this is different" moment |

---

## Why This UX?

Our target user is a young adult who wants to build financial confidence but has bad spending habits and low financial literacy. That creates a core design constraint:

**If your user can read a dashboard and draw conclusions from a chart, they're already financially literate — they don't need you.**

Existing apps (Credit Karma, Rocket Money, Mint) display the data banks already provide. They assume the user knows what to do with it. artha assumes they don't.

So we use UX patterns young adults already understand:
- **Swipe cards (Tinder-style)** — one insight per card, tap or swipe to advance. Designed for increasingly shorter attention spans.
- **Scrollable stories (Instagram-style)** — the Future timeline uses scroll-linked animations to reveal your financial trajectory one act at a time.
- **Conversational AI (chat + voice)** — instead of making users interpret data, artha explains it to them in plain language and suggests what to do next.

The result: **personalized, bite-sized, proactive financial guidance** — not a data dump the user has to interpret on their own.

Where existing apps stop at *displaying* bank data, artha goes one step further:
- **Proactive nudges** — we tell you about your spending patterns before you notice them
- **Behavioral pattern detection** — no other consumer fintech app on the market does this
- **Actionable levers** — we don't just say "you spend too much on coffee," we show you exactly how cutting back changes your 5-year trajectory and retirement number
- **Channel delivery** — insights reach you through Telegram, WhatsApp, or iMessage — the apps you already live in
- **Daily nudge + weekly story** — automated cron jobs that keep users engaged without them having to open the app

Storytelling, proactive insights, and meeting users where they are — that's the differentiator.

---

## Features

### Landing & Onboarding
- **Animated 3-phase landing** — brand reveal, hook, and interactive Spending DNA visualization with particle background
- **5-step onboarding** — age, income, savings, financial goals (with emoji picker), and Plaid bank connection
- **Plaid bank connection** — the core data source that powers all insights, patterns, and projections; users can skip during onboarding but the app prompts them to connect throughout the experience
- **Progress persistence** — onboarding state saved to localStorage, resumable across sessions
- **Smart redirects** — returning users skip onboarding automatically

### Moments (Spending Insights Feed)
- **Swipeable card stack** — Stories-style interface with progress bars, tap/swipe navigation, and peek cards; designed so users who can't read traditional financial charts still get personalized, actionable insights
- **9 personalized insight cards** per session, generated from the user's actual bank data:
  - **WIN** — celebrates savings streaks with Spending DNA visualization
  - **RHYTHM** — spending heatmap (7-day x 24-hour grid) showing when money leaves your account
  - **DISCOVERY** — reveals hidden patterns (Sunday night ordering, payday effect)
  - **LEARN** — behavioral psychology explainers (mental accounting bias, status quo bias)
  - **NUDGE** — subscription audit with monthly/annual cost breakdowns
  - **CHALLENGE** — actionable weekly challenges (meal prep Sundays, no-spend evenings)
  - **GOAL** — acceleration projections showing months saved from habit changes
- **Peer comparisons** — contextual stats like "83% of users with this pattern cut it in half within 2 months"
- **Challenge acceptance** — users commit to challenges, which are tracked as commitment signals in the engagement state (persisted to both localStorage and database)

### Future (Financial Projections)
- **Three-act scrollable timeline**:
  1. **"Where You Are"** — animated current savings, income, and saving rate
  2. **"Two Paths Diverge"** — dual-path SVG chart showing current vs. optimized trajectory with interactive savings levers
  3. **"The Reveal"** — compound growth calculation showing the effect of enabled levers from the user's current age to retirement (65), dynamically computed per user
- **Personalized savings levers** — built from the user's actual detected spending patterns with real dollar amounts (e.g., if you spend $80/mo on Sunday delivery, the lever shows $60/mo savings at 75% reduction) — chart updates in real time as you toggle
- **Emergency fund race** — months-to-safety countdown at current vs. optimized pace
- **Scroll-linked animations** — path drawing, section snapping, and progress dots

### artha AI (Coach)
- **Text chat** with GPT-4o — contextual financial advice using your actual spending data, goals, and behavioral patterns
- **OpenAI Realtime voice** — WebRTC-based conversational voice mode with animated orb, speaking/listening states, and transcript persistence
- **4 tool functions** — AI can create/update goals, update your profile, and retrieve goal data mid-conversation
- **AI memory** — extracts personal facts (preferences, goals, habits, life events) from conversations for long-term context
- **Dynamic system prompts** — built from your profile, transactions, detected patterns, and memory facts
- **Smart notifications** — 7 types of agent messages (nudges, wins, discoveries, goal updates, challenges, awareness, consequences)
- **Data cards** — inline financial tradeoff visualizations within chat messages
- **Quick reply chips** — suggested follow-up questions after each response

### You (Profile & Goals)
- **Editable financial profile** — inline editing for income, savings, and age
- **Goal management** — create up to 3 goals with emoji picker, circular progress rings, and target tracking
- **Bank connection** — Plaid Link integration; essential for powering all insights, patterns, and projections
- **Spending summary** — top 5 categories by spend amount

### Settings
- **Channel preferences** — notification channel selection (Telegram, WhatsApp, iMessage)
- **Data management** — clear chat history with confirmation flow
- **Account** — profile display and sign out

### Engagement System
- **Daily streaks** — consecutive-day tracking with milestone badges (sparkle, fire, star)
- **Challenges** — accepted from insight cards, tracked persistently
- **Agent messages** — unread count badge, intersection-observer read tracking
- **Dual persistence** — localStorage + database sync

### Automated Jobs (Vercel Crons)
- **Daily nudge** (6pm UTC) — contextual spending reminders
- **Weekly story** (Monday 9am UTC) — AI-generated weekly money narrative saved to chat
- **Plaid sync** (6am UTC) — incremental transaction sync from connected banks

---

## Visualizations

| Component | Description |
|---|---|
| **Spending DNA** | Radial chart with 6-8 axes mapping behavioral patterns — derives a money personality label (The Strategist, The Balanced Realist, etc.) |
| **Spending Heatmap** | 7x24 grid (days x hours) with purple-to-gold intensity coloring, hover tooltips showing spend amount and top merchant |
| **Dual Path Chart** | SVG line/area chart comparing current vs. optimized savings trajectory over 60 months |
| **Progress Ring** | Circular SVG progress indicator for goal tracking with emoji centers |
| **Animated Numbers** | RequestAnimationFrame-based smooth number transitions with easing |
| **Reveal Number** | Large number entrance with radial glow burst for compound growth reveals |

---

## Architecture

```
Next.js 16 + TypeScript
├── Behavioral Analysis Engine     7 pattern detectors on transaction history
├── GPT-4o AI Coach                Text chat with tool calling + memory extraction
├── OpenAI Realtime Voice          WebRTC voice sessions with Whisper transcription
├── Projection & Compound Math     Savings simulations with interactive levers
├── Framer Motion Animations       Scroll-linked, staggered, spring-physics motion
├── Engagement System              Streaks, challenges, agent messages
├── Plaid Integration              Bank connection, incremental transaction sync
└── Neon PostgreSQL + Drizzle      8-table schema with encrypted token storage
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| AI | OpenAI GPT-4o (chat + tools), OpenAI Realtime (voice), Whisper (transcription) |
| Auth | Clerk (OAuth, email) |
| Database | PostgreSQL on Neon (serverless) via Drizzle ORM |
| Banking | Plaid SDK (transaction sync, webhooks) |
| Icons | Phosphor Icons, Lucide React |
| Fonts | Space Grotesk (display), Inter (body) |
| Deployment | Vercel (with cron jobs) |

### Database Schema

```
users                     Core profile (id, name, age, income, savings)
├── financialGoals        Up to 3 goals per user (name, target, current, emoji)
├── transactions          Bank transactions (amount, merchant, category, day/hour)
├── chatHistory           Chat + voice transcripts (role, content, data cards)
├── aiMemory              Extracted facts (category: preference/goal/habit/life_event)
├── engagementState       Streaks, active challenges, read message IDs
├── plaidItems            Connected banks (encrypted access tokens, sync cursors)
└── channelPreferences    Notification channel toggles (telegram, whatsapp, imessage)
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          Landing page (3-phase animation)
│   ├── layout.tsx                        Root layout (Clerk provider)
│   ├── globals.css                       Theme variables + glass utility
│   ├── sign-in/[[...sign-in]]/          Clerk sign-in
│   ├── sign-up/[[...sign-up]]/          Clerk sign-up
│   ├── onboarding/                       5-phase onboarding flow
│   ├── outro/                            Innovation pillars showcase
│   └── (app)/                            Protected app shell
│       ├── layout.tsx                    NavBar + EngagementProvider
│       ├── moments/                      Insight card feed
│       ├── future/                       Projection timeline
│       ├── coach/                        AI chat + voice
│       ├── you/                          Profile + goals
│       └── settings/                     Preferences + data management
├── app/api/
│   ├── chat/                             Chat messages + history
│   ├── voice/                            Realtime sessions, tools, transcripts
│   ├── user/                             Profile CRUD
│   ├── goals/                            Goal CRUD
│   ├── transactions/                     Transaction retrieval
│   ├── engagement/                       Streak + challenge state
│   ├── preferences/                      Channel preferences
│   ├── analyze/                          AI-powered analysis
│   ├── plaid/                            Link token, exchange, sync, webhook
│   └── cron/                             Daily nudge, weekly story, plaid sync
├── components/                           28 React components
│   ├── ChatInterface.tsx                 Chat UI with message bubbles
│   ├── VoiceMode.tsx                     Full-screen voice overlay with orb
│   ├── CardStack.tsx                     Swipeable stories-style card stack
│   ├── StoryCard.tsx                     Individual insight card renderer
│   ├── SpendingDNA.tsx                   Radial behavioral pattern chart
│   ├── SpendingHeatmap.tsx               7x24 spending time grid
│   ├── DualPathChart.tsx                 Current vs optimized SVG paths
│   ├── FutureTimeline.tsx                3-act scrollable projection view
│   ├── ProjectionSlider.tsx              Interactive savings lever toggles
│   ├── NavBar.tsx                        Bottom tab navigation (4 tabs)
│   ├── EngagementProvider.tsx            Streak/challenge context provider
│   ├── EngagementHeader.tsx              Greeting + streak + notification bell
│   └── ...                               Avatars, badges, animations, etc.
├── lib/                                  Business logic
│   ├── analysis.ts                       7 behavioral pattern detectors
│   ├── insights.ts                       9-card insight generator
│   ├── projections.ts                    Savings projection math
│   ├── chat-shared.ts                    System prompts + tool definitions
│   ├── claude.ts                         OpenAI client + callWithTools
│   ├── memory-extractor.ts              AI fact extraction from conversations
│   ├── agent-messages.ts                 Smart notification generation
│   ├── engagement.ts                     Streak + challenge logic
│   ├── dna.ts                            Radial chart math + personality labels
│   ├── heatmap.ts                        Spending time-grid aggregation
│   ├── plaid.ts                          Plaid client setup
│   ├── plaid-sync.ts                     Incremental transaction sync
│   ├── plaid-mapper.ts                   Plaid → app transaction mapping
│   ├── encryption.ts                     AES-256-GCM for access tokens
│   ├── rate-limit.ts                     In-memory per-IP rate limiter
│   └── auth-helpers.ts                   Input sanitization for LLM prompts
├── hooks/
│   ├── useTransactions.ts                Data fetching + pattern detection
│   ├── useInsights.ts                    Insight navigation state
│   └── useRealtimeVoice.ts              WebRTC voice session management
├── db/
│   ├── schema.ts                         Drizzle table definitions (8 tables)
│   ├── queries.ts                        Type-safe query functions
│   └── index.ts                          Neon client singleton
└── types/
    └── index.ts                          Shared TypeScript interfaces
```

---

## Behavioral Pattern Detection

artha's analysis engine runs 7 detectors on your transaction history:

| Pattern | Detection Logic | Savings Lever |
|---|---|---|
| **Sunday Night Orderer** | 4+ delivery app orders on Sundays 7-10pm | Meal prep Sundays (75% impact) |
| **Payday Splurger** | 1.5x+ spending within 3 days of payday | Reduce payday splurge 30% |
| **Subscription Creep** | 2+ recurring subscription charges | Cut unused subscriptions (50% impact) |
| **Daily Coffee** | 15+ coffee shop transactions in 6 months | Coffee at home 3 days/week (50% impact) |
| **Weekend Spending Gap** | >50% discretionary spending on Fri-Sun | Awareness (no lever) |
| **Savings Trend** | 20%+ growth in savings transfers over 3+ months | Positive indicator (celebrated) |
| **Impulse Amazon** | 5+ Sunday evening Amazon purchases | Awareness + annual impact |

Each pattern calculates monthly impact, annual impact, and goal delay in days.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database ([Neon](https://neon.tech) recommended)
- [Clerk](https://clerk.com) account
- [OpenAI](https://platform.openai.com) API key
- [Plaid](https://plaid.com) account (required — bank data powers all insights and projections)

### Environment Variables

Create a `.env.local` file from the template:

```bash
cp .env.example .env.local
```

```env
# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...

# AI (OpenAI)
OPENAI_API_KEY=sk-proj-...

# Encryption (256-bit hex key for Plaid token storage)
ENCRYPTION_KEY=your_64_char_hex_string

# Plaid (required — bank data powers all features)
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox

# Voice (optional)
OPENAI_REALTIME_VOICE=ash

# Crons & Webhooks
CRON_SECRET=your_cron_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed demo data (optional)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Commands

```bash
npm run db:generate   # Generate Drizzle migrations
npm run db:push       # Apply schema to database
npm run db:studio     # Open Drizzle Studio GUI
npm run db:seed       # Seed demo transaction data
```

---

## User Flow

```
Landing Page (/)
  │  3-phase animation: brand → hook → Spending DNA
  │  "Discover Your Story" CTA
  ▼
Sign Up (/sign-up)
  │  Clerk OAuth / email authentication
  ▼
Onboarding (/onboarding)
  │  Phase 1: Age
  │  Phase 2: Monthly income
  │  Phase 3: Current savings
  │  Phase 4: Financial goals (up to 3, with emojis)
  │  Phase 5: Bank connection (Plaid — essential for full experience)
  ▼
Moments (/moments)  ←  Main entry point after onboarding
  │  Swipeable insight cards with behavioral analysis
  │  Last card navigates to →  Future (/future)
  │
  ├── Future (/future)
  │     3-act projection timeline with interactive levers
  │
  ├── artha AI (/coach)
  │     Text chat + voice mode with GPT-4o
  │
  ├── You (/you)
  │     Profile, goals, bank connection, spending summary
  │
  └── Settings (/settings)
        Channel preferences, data management, sign out
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `artha-bg` | `#0a0a0f` | App background |
| `artha-surface` | `#1a1a2e` | Card surfaces |
| `artha-accent` | `#6c63ff` | Primary purple accent |
| `artha-green` | `#4ade80` | Success / savings |
| `artha-gold` | `#fbbf24` | Highlights / intensity |
| `artha-text` | `#e2e8f0` | Primary text |
| `artha-muted` | `#94a3b8` | Secondary text |

**Glass morphism** utility: `rgba(26,26,46,0.6)` background + `blur(12px)` + subtle purple border

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | Optional | Send message to AI coach |
| GET | `/api/chat/history` | Required | Retrieve chat history |
| DELETE | `/api/chat/history` | Required | Clear chat history |
| POST | `/api/voice/session` | Optional | Create Realtime voice session |
| POST | `/api/voice/tools` | Optional | Execute voice tool call |
| POST | `/api/voice/transcripts` | Required | Persist voice transcripts |
| GET/POST | `/api/user` | Required | Get or create user profile |
| GET/POST/PATCH/DELETE | `/api/goals` | Required | Financial goal CRUD |
| GET | `/api/transactions` | Required | Get user transactions |
| GET/POST | `/api/engagement` | Required | Streak and challenge state |
| GET/POST | `/api/preferences` | Required | Channel preferences |
| POST | `/api/analyze` | Required | AI behavioral analysis |
| POST | `/api/plaid/create-link-token` | Required | Initialize Plaid Link |
| POST | `/api/plaid/exchange-token` | Required | Exchange Plaid token |
| POST | `/api/plaid/sync` | Required | Manual transaction sync |
| POST | `/api/plaid/webhook` | Plaid JWT | Handle Plaid webhooks |
| GET | `/api/cron/daily-nudge` | Bearer | Daily spending nudge |
| GET | `/api/cron/weekly-story` | Bearer | Weekly money narrative |
| GET | `/api/cron/plaid-sync` | Bearer | Incremental bank sync |

---

## Security

- **Authentication** — Clerk OAuth with server-side verification on every API route
- **Data isolation** — all database queries scoped by `userId`
- **Encryption at rest** — Plaid access tokens encrypted with AES-256-GCM
- **Rate limiting** — per-IP in-memory limits (chat: 30/min, voice: 10/min)
- **Input sanitization** — XML/HTML/JSON stripped before LLM prompts
- **Webhook verification** — Plaid JWT signature validation with constant-time comparison
- **Cron authentication** — bearer token verification for scheduled jobs

---

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push to GitHub
2. Import project in Vercel dashboard
3. Set all environment variables
4. Deploy

Cron jobs are configured in `vercel.json` and run automatically:
- Daily nudge: `0 18 * * *`
- Weekly story: `0 9 * * 1`
- Plaid sync: `0 6 * * *`

---

## License

Private — all rights reserved.
