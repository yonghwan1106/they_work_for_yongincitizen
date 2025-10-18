# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"그들은 용인시민을 위해 일합니다" (They Work for Yongin Citizens) is a **data journalism-driven civic oversight platform** for monitoring the Yongin City Council.

This project combines three DNA strands:
- **TheyWorkForYou (UK)**: Parliamentary data archiving & search
- **Newstapa (KR)**: Data journalism & investigative reporting ("세금도둑 추적")
- **ProPublica (US)**: Open-source data infrastructure

**Current Status:** Phase 1 MVP in progress (~80% complete). 31 councillors scraped and stored in Supabase.

## Core Vision

1. **Radical Accessibility**: Make complex parliamentary data understandable to all citizens
2. **Data-Driven Accountability**: Prove accountability through data, not opinions
3. **Investigative Infrastructure**: Build citizen infrastructure for investigative journalism
4. **Strict Non-partisanship**: Maintain political neutrality

## Core Architecture

### Tech Stack (from PRD v2.0)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR for SEO, deployed on Vercel |
| **Backend/DB** | Supabase (PostgreSQL) | Auth, Storage, Realtime, pgvector for RAG |
| **Data Collection** | Python (BeautifulSoup, Playwright) | Scraping council.yongin.go.kr |
| **AI** | Anthropic Claude 3.5 Sonnet | Korean speech summarization, vote extraction, RAG chatbot |
| **Maps** | Naver Maps API | Geocoding for "Find My Councillor" |
| **Email** | Resend API | Notification system, newsletter |
| **Public Data** | data.go.kr API | Electoral district boundaries |
| **Visualization** | D3.js, Recharts | Network graphs, voting charts, interactive maps |

### Development Phases

The project follows a 3-phase roadmap (see `/docs/prd v2.0.md` for full details):

#### Phase 1 - MVP (Foundation) - **IN PROGRESS**

**Goal:** Core data aggregation system

Features:
- ✅ Councillor digital profiles (31 councillors scraped)
- 🔄 Searchable meeting archive (scraper TODO)
- 🔄 Bill tracker (scraper TODO)
- ✅ Data scraping pipeline framework
- ✅ Next.js web application with Supabase integration

#### Phase 2 - Accountability Engine

**Goal:** AI-powered analysis system

Features:
- AI-powered speech extraction from meeting transcripts (Claude API)
- Individual voting records extraction (NLP + human-in-the-loop verification)
- Enhanced councillor profiles with speech history and voting records
- Admin dashboard for vote verification

**Critical Challenge:** Voting records are NOT structured in the official website. They exist embedded in meeting transcripts and need to be extracted using NLP + manual verification with `is_verified` flag.

#### Phase 3 - Engagement & Investigation

**Goal:** Citizen participation + investigative projects

Features:
- "Find my councillor" by address (Naver Maps + PostGIS)
- Email notification system for keywords/councillors/bills
- AI-powered Q&A chatbot using RAG architecture
- **Investigative Projects** (NEW in v2.0):
  - "해외출장 사용 내역 추적" (Overseas trip expense tracking)
  - "의정비 투명성 리포트" (Councillor expense transparency)
  - "개발 사업 추적" (Development project tracking)

## Key Data Sources

- **Yongin City Council Website:** council.yongin.go.kr
  - Councillor profiles: `/kr/member/list.do`
  - Meeting transcripts: `/kr/minutes/late.do`
  - Bill information: `/kr/bill.do`
  - Committee activities

**Data Collection Strategy:**
- Scrape publicly available data (fair use principle, following TheyWorkForYou precedent)
- Always cite sources and link back to official records
- Build value through better UX rather than waiting for official API
- Platform success → advocate for official open data policies

## Database Schema

### Core Tables (Phase 1)
```sql
councillors         -- Councillor profiles (name, party, district, photo, contact)
committees          -- Committee information
councillor_committees -- Councillor-committee relationships
meetings            -- Meeting metadata (date, type, transcript_url, transcript_text)
bills               -- Bill information (bill_number, title, status, proposer)
bill_cosponsors     -- Bill co-sponsors
```

### Phase 2 Tables (Accountability)
```sql
speeches            -- Extracted speeches (councillor_id, meeting_id, speech_text, ai_summary, keywords)
votes               -- Voting records (bill_id, councillor_id, vote_cast, is_verified)
                    -- is_verified: Human-verified data (manual check required)
```

### Phase 3 Tables (Engagement & Investigation)
```sql
district_mapping    -- Electoral district mapping (district → administrative dong)
user_profiles       -- Extended user profiles (linked to auth.users)
subscriptions       -- Notification subscriptions (type: councillor/keyword/bill)
notification_logs   -- Email notification history
chat_history        -- AI chatbot conversation history
speech_embeddings   -- Vector embeddings for RAG (pgvector)

-- NEW in PRD v2.0: Investigative Projects
investigations      -- Investigative project metadata (title, category, findings, visualizations)
investigation_councillors -- Links councillors to investigations
```

### Key Indexes
- Full-text search using `pg_trgm` (trigram) for Korean text
- Vector similarity search using `pgvector` (Phase 3)
- Date-based indexes for meetings and bills

## AI Integration Points

### Phase 2: AI Processing
1. **Speech Summarization:**
   - Input: Raw meeting transcript text
   - Process: Claude API → Parse by speaker → Generate 3-5 line summary per speech
   - Output: `speeches.summary`, `speeches.keywords`
   - Storage: Summaries in `speeches` table, embeddings in `speech_embeddings`

2. **Voting Record Extraction:**
   - Input: Meeting transcript text
   - Process: Claude API (structured output) + regex → Extract voting results
   - Challenge: Individual votes often NOT recorded (거수표결)
   - Solution: NLP extraction + **human verification** (`is_verified` flag)
   - Output: `votes` table with `is_verified=false` → Admin dashboard review → `is_verified=true`

### Phase 3: RAG Chatbot
3. **Q&A Chatbot:**
   - Architecture: Vector search (pgvector) + Claude API
   - Flow:
     1. User question → Generate embedding
     2. Vector similarity search on `speech_embeddings`
     3. Retrieve top-k relevant speeches
     4. Claude API with prompt: "Answer based ONLY on these meeting transcripts. Do not speculate."
     5. Return answer + source links (meeting_id, speech_id)

## Design Principles

1. **Radical Accessibility**: Make complex parliamentary data understandable to all citizens
2. **Strict Non-partisanship**: Present data objectively without political bias
3. **Mobile-first**: Responsive design optimized for mobile devices
4. **Transparency**: Always cite sources and link back to official records
5. **Data Quality**: Use `is_verified` flags and show confidence levels

## Documentation Structure

- `/docs/prd v2.0.md`: **PRIMARY REFERENCE** - Product Requirements Document (data journalism approach)
- `/docs/prd v1.0.md`: Original PRD (technical roadmap)
- `/docs/proposal.md`: Strategic blueprint analyzing TheyWorkForYou model and Yongin data landscape
- `/docs/userjourney.md`: User journey maps for 3 personas (citizen, activist, journalist)
- `/docs/용인 워치독.pdf`: Investigative journalism framework (Newstapa benchmarking)

## Current Implementation Status

### ✅ Completed (Phase 1)
- Next.js 15 project setup with App Router
- Supabase integration (PostgreSQL + Auth + Storage)
- Database schema design with RLS policies
- Councillor scraper (Python + BeautifulSoup)
  - 31 councillors collected from council.yongin.go.kr
  - Stored in Supabase `councillors` table
- Web pages:
  - `/` - Homepage
  - `/councillors` - Councillor list
  - `/councillors/[id]` - Councillor detail (profile, speeches, votes)
- TypeScript types (`/web/src/types/`)

### 🔄 In Progress (Phase 1)
- Meeting scraper (Python)
- Bill scraper (Python)
- Meeting archive page
- Bill tracker page
- Full-text search implementation

### 📋 TODO (Phase 1)
- Implement meeting scraper (`/scraper/scrapers/meetings.py`)
- Implement bill scraper (`/scraper/scrapers/bills.py`)
- Web pages:
  - `/meetings` - Meeting archive with search
  - `/meetings/[id]` - Meeting detail (transcript, video)
  - `/bills` - Bill tracker
  - `/bills/[id]` - Bill detail (cosponsors, votes)
- Deploy to Vercel
- Set up cron job for daily scraping

### 📋 TODO (Phase 2)
- Claude API integration for speech extraction
- Speech summarization pipeline
- Vote extraction with NLP
- Admin dashboard for vote verification
- Enhanced councillor profiles with speeches/votes

### 📋 TODO (Phase 3)
- "Find My Councillor" feature (Naver Maps + PostGIS)
- Email notification system (Resend API)
- RAG chatbot (pgvector + Claude API)
- Investigative project pages
- Data visualization (D3.js)

## Data Collection Strategy

### Scraping Workflow
1. **Python scraper** (BeautifulSoup/Playwright) → HTML parsing
2. **Data cleaning** (Pandas) → Structured JSON
3. **Supabase upload** (Service role key) → PostgreSQL
4. **Next.js frontend** → Fetch from Supabase (Anon key)

### Scraper Architecture
```
scraper/
├── scrapers/
│   ├── councillors.py  ✅ DONE (31 councillors)
│   ├── meetings.py     🔄 TODO
│   └── bills.py        🔄 TODO
├── utils/
│   └── db.py           -- Supabase helper functions
├── config.py           -- Environment config
└── main.py             -- CLI entry point
```

### Running Scrapers
```bash
cd scraper
python -m scrapers.councillors  # ✅ Works (31 councillors collected)
python -m scrapers.meetings     # 🔄 TODO
python -m scrapers.bills        # 🔄 TODO
```

## Legal Considerations

- Official website has copyright notice (COPYRIGHT © 2021 YONGIN COUNCIL)
- **Strategy:** Proceed under "fair use" for non-commercial public interest
  - Always attribute data source and provide links to official records
  - Transform data (summarization, analysis, visualization) rather than verbatim republishing
  - Platform success can lead to official data sharing agreements (TheyWorkForYou precedent)
- **Transparency:** About page will document data sources and methodology

## Ethical Guidelines (PRD v2.0)

### Non-partisanship
- Do NOT favor or criticize any party/councillor
- Present data as-is
- Minimize editorial commentary (facts only)

### Transparency
- Cite all data sources
- Label AI-generated content clearly ("AI Summary")
- Correct errors immediately with public notice
- Publish financial records (income/expenses)

### Privacy
- Councillors are public figures → public information is fair game
- Do NOT collect citizen personal data (except email for notifications)
- No comment section (prevent harassment)

### Accountability
- User reporting feature (data errors, ethical violations)
- Independent advisory board (journalists, lawyers, civic groups)
- Annual transparency report

## Development Guidelines

### When Implementing Features

1. **Always check PRD v2.0 first** (`/docs/prd v2.0.md`)
2. **Database changes:**
   - Update `/supabase/schema.sql`
   - Create migration in `/supabase/migrations/`
   - Apply to Supabase project
3. **Scraper development:**
   - Save sample HTML to `/scraper/*.html` for analysis
   - Use BeautifulSoup for static pages, Playwright for dynamic content
   - Store data using Service role key (in `.env`, NEVER commit)
   - Verify data quality before mass upload
4. **Frontend development:**
   - Use Next.js App Router (not Pages Router)
   - Fetch data server-side when possible (SSR for SEO)
   - Use Supabase Anon key for public data
   - Mobile-first responsive design (Tailwind CSS)
5. **AI integration:**
   - Use Claude 3.5 Sonnet API (good Korean performance)
   - Always include source citations in AI responses
   - Never let AI "hallucinate" - constrain to provided data
   - Label AI-generated content clearly in UI

### Code Style
- TypeScript strict mode
- ESLint configuration (see `/web/eslint.config.mjs`)
- Prettier formatting
- Korean comments OK for domain-specific logic

### Git Workflow
- Branch naming: `feature/meetings-scraper`, `fix/vote-extraction`
- Commit messages: English preferred, Korean OK
- PR description: Link to relevant PRD section

## Key Challenges & Solutions

### Challenge 1: Voting Records Not Available
**Problem:** council.yongin.go.kr does NOT publish individual voting records in structured format

**Solution (Phase 2):**
1. NLP extraction from transcripts using Claude API
2. Human-in-the-loop verification (admin dashboard)
3. `is_verified` flag in database
4. Show "Unverified" label in UI for unverified votes
5. Long-term: Advocate for official data publication after platform success

### Challenge 2: Meeting Transcript Format Inconsistency
**Problem:** HTML/PDF structure varies across meetings

**Solution:**
- Learn diverse patterns (regex + AI)
- Fallback logic: If parsing fails, store raw text
- Continuous monitoring and pattern updates

### Challenge 3: AI Cost Management
**Problem:** Claude API is pay-per-token

**Solution:**
- Token limits (input 2000, output 200 per speech)
- Batch processing to minimize API calls
- Caching (don't re-summarize same transcript)
- **Cost estimate:** ~$50-100 for Phase 2 (1000 speeches)

### Challenge 4: Data Scraping Legal Risk
**Problem:** Copyright notice on official website

**Solution:**
- Fair use principle (non-commercial public interest)
- Data transformation (summaries, analysis, viz)
- Always cite sources
- TheyWorkForYou precedent: Start without permission → Negotiate after proving value

## Next Immediate Steps

### Phase 1 MVP Completion (Priority Order)
1. **Implement meetings scraper**
   - URL: https://council.yongin.go.kr/kr/minutes/late.do
   - Parse: meeting title, date, type, committee, transcript URL, video URL
   - Download transcript HTML/PDF → Extract text → Store in `meetings.transcript_text`

2. **Implement bills scraper**
   - URL: https://council.yongin.go.kr/kr/bill.do
   - Parse: bill number, title, proposer, status, proposal date
   - Store in `bills` table
   - Parse co-sponsors → Store in `bill_cosponsors`

3. **Build meeting/bill web pages**
   - `/meetings` - List all meetings with search
   - `/meetings/[id]` - Meeting detail with full transcript
   - `/bills` - Bill tracker with status filters
   - `/bills/[id]` - Bill detail with proposer/co-sponsors

4. **Deploy to Vercel**
   - Connect GitHub repo
   - Set environment variables
   - Test production build

5. **Set up automated scraping**
   - Vercel Cron Functions or GitHub Actions
   - Daily run at 2 AM KST
   - Error notifications

## Reference Links

- **Official Data Source:** https://council.yongin.go.kr
- **Supabase Project:** (Check `.env.local` for URL)
- **Vercel Deployment:** (To be set up)
- **PRD v2.0:** `/docs/prd v2.0.md` (PRIMARY REFERENCE)
- **Claude API Docs:** https://docs.anthropic.com
- **Naver Maps API:** https://navermaps.github.io/maps.js.ncp

## Questions or Clarifications

If implementing a feature and uncertain about requirements:
1. Check `/docs/prd v2.0.md` first
2. Look for similar examples in TheyWorkForYou or Newstapa
3. Ask user for clarification
4. Document decision in code comments

---

**Remember:** This is not just a tech platform - it's a **civic infrastructure for democratic accountability**. Every feature should serve the goal of making government more transparent and accessible to citizens.
