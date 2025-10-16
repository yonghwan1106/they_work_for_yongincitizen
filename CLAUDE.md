# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"그들은 용인시민을 위해 일합니다" (They Work for Yongin Citizens) is a civic tech platform for monitoring the Yongin City Council. This project is inspired by the UK's TheyWorkForYou platform, aiming to make parliamentary data accessible and understandable to citizens.

**Current Status:** Planning and documentation phase. No code implementation yet.

## Core Architecture

### Tech Stack (from PRD)

- **Frontend:** Next.js (will be deployed on Vercel)
- **Database/Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Data Collection:** Python (BeautifulSoup, Requests, Pandas)
- **AI:** Anthropic Claude 3 Sonnet API
- **Maps:** Naver Maps API (Geocoding)
- **Email:** Resend API (for notification system)
- **Public Data:** data.go.kr API (electoral district data)

### Development Phases

The project follows a 3-phase roadmap:

1. **Phase 1 - MVP (Foundation)**: Core data aggregation
   - Councillor digital profiles
   - Searchable meeting archive
   - Bill tracker
   - Data scraping pipeline from council.yongin.go.kr

2. **Phase 2 - Accountability Engine**: Critical features
   - AI-powered speech extraction from meeting transcripts
   - Individual voting records extraction (NLP + human-in-the-loop)
   - Enhanced councillor profiles with speech history and voting records

3. **Phase 3 - Engagement**: Citizen participation
   - "Find my councillor" by address
   - Email notification system for keywords/councillors/bills
   - AI-powered Q&A chatbot using RAG architecture

## Key Data Sources

- **Yongin City Council Website:** council.yongin.go.kr
  - Councillor profiles
  - Meeting transcripts (text and video)
  - Bill information
  - Committee activities

**Critical Challenge:** Individual voting records are not structured in the official website - they exist embedded in meeting transcripts and need to be extracted using NLP or manual verification.

## Database Schema (Planned)

Core tables in Supabase:
- `councillors`: Councillor profiles
- `meetings`: Meeting metadata
- `bills`: Bill information
- `speeches`: Extracted speeches (councillor_id, meeting_id, speech_text, summary, keywords)
- `votes`: Voting records (bill_id, councillor_id, vote_cast, is_verified)
- `subscriptions`: User notification preferences

## Design Principles

1. **Radical Accessibility**: Make complex parliamentary data understandable to all citizens
2. **Strict Non-partisanship**: Present data objectively without political bias
3. **Mobile-first**: Responsive design optimized for mobile devices
4. **Transparency**: Always cite sources and link back to official records

## Documentation Structure

- `/docs/proposal.md`: Strategic blueprint analyzing TheyWorkForYou model and Yongin data landscape
- `/docs/prd.md`: Product Requirements Document with detailed feature specifications
- `/docs/userjourney.md`: User journey maps for 3 personas (citizen, activist, journalist)

## Data Collection Strategy

The project follows the TheyWorkForYou precedent:
- Start by scraping publicly available data (fair use principle)
- Build value through better UX rather than waiting for official API
- Use platform success to advocate for official open data policies
- Maintain transparency by citing all data sources

## AI Integration Points

1. **Speech Summarization**: Claude API to summarize lengthy speeches into 3-5 key points
2. **Voting Record Extraction**: NLP + Claude to parse voting information from transcripts
3. **RAG Chatbot**: Vector search (Supabase pgvector) + Claude for Q&A

## Legal Considerations

- Official website has copyright notice (COPYRIGHT © 2021 YONGIN COUNCIL)
- Strategy: Proceed under "fair use" for non-commercial public interest
- Always attribute data source and provide links to official records
- Platform success can lead to official data sharing agreements (TheyWorkForYou precedent)
