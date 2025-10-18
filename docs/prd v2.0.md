# Product Requirements Document v2.0
# "그들은 용인시민을 위해 일합니다" (They Work for Yongin Citizens)

**Version:** 2.0
**Last Updated:** 2025-10-18
**Status:** Planning Phase

---

## Executive Summary

"그들은 용인시민을 위해 일합니다"는 단순한 의정 정보 제공 플랫폼을 넘어, **데이터 저널리즘 기반의 시민 감시 플랫폼**입니다.

영국의 TheyWorkForYou의 의정 투명성 모델과 뉴스타파의 탐사보도 DNA를 결합하여, 용인시의회 데이터를 시민이 이해하고 행동할 수 있는 형태로 재구성합니다.

### Core Vision

1. **Radical Accessibility**: 복잡한 의정 데이터를 모든 시민이 이해할 수 있게
2. **Data-Driven Accountability**: 데이터로 증명하는 의정 감시
3. **Investigative Infrastructure**: 탐사보도를 위한 시민 인프라 구축
4. **Strict Non-partisanship**: 정치적 중립성 유지

---

## 1. Strategic Context

### 1.1 Problem Statement

**현재 용인시의회 정보의 문제점:**
- 산재된 정보: 의원 프로필, 회의록, 조례안이 각각 다른 페이지에 분산
- 검색 불가능: 특정 의원의 발언이나 투표 기록을 추적할 방법이 없음
- 맥락 부재: 개별 안건의 배경과 영향을 이해하기 어려움
- 데이터 접근성 부족: 분석 가능한 형태의 구조화된 데이터 미제공

**시민의 실질적 요구:**
- "우리 선거구 의원이 무슨 일을 하는지 알고 싶다"
- "세금이 어떻게 쓰이는지 감시하고 싶다"
- "중요한 안건에 대해 알림을 받고 싶다"
- "의정 활동을 쉽게 이해하고 싶다"

### 1.2 Benchmarking: 3가지 DNA의 융합

| Platform | Core Strength | What We Adopt |
|----------|---------------|---------------|
| **TheyWorkForYou (UK)** | 의정 데이터 아카이빙 & 검색 | 의원별 프로필, 발언 아카이브, 법안 추적 시스템 |
| **뉴스타파 (KR)** | 데이터 저널리즘 & 탐사보도 | "세금도둑 추적" 프로젝트 방식, 시각화, 시민 펀딩 모델 |
| **ProPublica (US)** | 오픈소스 데이터 인프라 | 재사용 가능한 데이터셋, API 제공, 공공 기여 유도 |

### 1.3 Differentiation

기존 플랫폼과의 차별점:
- **지방의회 특화**: 국회가 아닌 기초의회 데이터 집중 (국내 최초)
- **AI 기반 분석**: Claude API를 활용한 회의록 요약, 발언 분석, Q&A
- **탐사 프로젝트**: 데이터를 활용한 구체적인 조사 보도 (예: 세금 낭비 추적)
- **시민 참여**: 알림 시스템, 키워드 추적, 지역구 의원 찾기

---

## 2. User Personas & Journey

### Persona 1: 일반 시민 (김민수, 35세, 회사원)

**Goals:**
- 우리 동네 시의원이 누구인지 알고 싶음
- 중요한 조례안 통과 시 알림 받고 싶음

**Pain Points:**
- 의회 홈페이지가 복잡하고 느림
- 전문 용어가 많아 이해하기 어려움

**User Journey:**
1. 주소 입력 → 지역구 의원 확인
2. 의원 프로필 페이지에서 최근 발언/투표 요약 확인
3. 관심 키워드("교통", "학교") 알림 설정
4. 주간 다이제스트 이메일 수신

### Persona 2: 시민운동가 (이정희, 42세, NGO 활동가)

**Goals:**
- 특정 안건(예: 개발 사업)에 대한 의원들의 입장 파악
- 예산 낭비 사례 발굴

**Pain Points:**
- 회의록을 일일이 읽어야 함
- 의원별 투표 기록이 정리되어 있지 않음

**User Journey:**
1. "개발" 키워드로 전체 회의록 검색
2. 법안별 투표 기록 확인 (찬성/반대/기권)
3. 의원별 투표 성향 분석 페이지 활용
4. 데이터 다운로드 (CSV) → 자체 분석

### Persona 3: 지역 기자 (박수진, 29세, 지역신문 기자)

**Goals:**
- 팩트 기반 기사 작성
- 독점 스토리 발굴

**Pain Points:**
- 의정 데이터가 분산되어 있어 시간 소모
- 과거 발언과 현재 입장 비교가 어려움

**User Journey:**
1. 특정 의원의 전체 발언 이력 검색
2. AI 요약으로 핵심 쟁점 파악
3. 챗봇에 질문: "김OO 의원이 지난 2년간 교통 예산에 대해 어떤 입장을 보였나요?"
4. 출처 링크와 함께 기사 작성

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR for SEO, 빠른 초기 로딩, Vercel 배포 |
| **Backend/DB** | Supabase (PostgreSQL) | Auth, Storage, Realtime, pgvector for RAG |
| **Data Collection** | Python (BeautifulSoup, Playwright) | council.yongin.go.kr 스크래핑 |
| **AI** | Anthropic Claude 3.5 Sonnet | 한국어 성능 우수, 긴 문맥 처리 |
| **Maps** | Naver Maps API | 용인시 선거구 경계, 주소→의원 매칭 |
| **Email** | Resend API | 알림 시스템, 뉴스레터 발송 |
| **Public Data** | data.go.kr API | 선거구 경계 데이터, 선거 결과 |
| **Visualization** | D3.js, Recharts | 네트워크 그래프, 투표 성향 차트 |

### 3.2 Database Schema

```sql
-- 의원 정보
CREATE TABLE councillors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  party TEXT,
  district TEXT,
  committee TEXT[],
  profile_image_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  office_address TEXT,
  term_start DATE,
  term_end DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회의 정보
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_type TEXT, -- 본회의, 상임위, 특별위
  committee TEXT,
  transcript_url TEXT,
  video_url TEXT,
  status TEXT, -- scheduled, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 발언 기록 (AI 추출)
CREATE TABLE speeches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  councillor_id UUID REFERENCES councillors(id),
  meeting_id UUID REFERENCES meetings(id),
  speech_order INTEGER,
  speech_text TEXT NOT NULL,
  ai_summary TEXT, -- Claude가 생성한 3-5줄 요약
  keywords TEXT[], -- AI 추출 키워드
  topic TEXT, -- 주제 분류 (예산, 교통, 교육 등)
  embedding VECTOR(1536), -- pgvector for RAG
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 법안/조례안 정보
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  bill_number TEXT UNIQUE,
  proposer_id UUID REFERENCES councillors(id),
  co_proposers UUID[], -- 공동발의자
  proposed_date DATE,
  status TEXT, -- 발의, 계류, 가결, 부결, 폐기
  summary TEXT,
  full_text_url TEXT,
  category TEXT, -- 예산, 조례 개정, 동의안 등
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 투표 기록 (NLP + 수작업 검증)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id),
  councillor_id UUID REFERENCES councillors(id),
  vote_cast TEXT CHECK (vote_cast IN ('찬성', '반대', '기권', '불참')),
  is_verified BOOLEAN DEFAULT false, -- 수작업 검증 여부
  verification_source TEXT, -- 회의록 페이지 등
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bill_id, councillor_id)
);

-- 알림 구독
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  subscription_type TEXT, -- keyword, councillor, bill
  target_value TEXT, -- 키워드 or 의원ID or 법안ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 탐사 프로젝트 (v2.0 추가)
CREATE TABLE investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- 예: "2024 해외출장 사용 내역 추적"
  description TEXT,
  category TEXT, -- 세금낭비, 이해충돌, 개발사업
  status TEXT, -- ongoing, completed
  published_date DATE,
  lead_data_source TEXT, -- 핵심 데이터 출처
  findings JSONB, -- 주요 발견 사항 (구조화)
  visualizations TEXT[], -- 관련 시각화 이미지 URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 탐사 프로젝트 - 의원 연결
CREATE TABLE investigation_councillors (
  investigation_id UUID REFERENCES investigations(id),
  councillor_id UUID REFERENCES councillors(id),
  involvement_description TEXT, -- 해당 의원의 연루 내용
  PRIMARY KEY (investigation_id, councillor_id)
);
```

### 3.3 Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Data Collection Layer (Python)                         │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Web Scraper   │  │ PDF Parser   │  │ API Client   ││
│  │ (BeautifulSoup│  │ (PyPDF)      │  │ (data.go.kr) ││
│  │  + Playwright)│  │              │  │              ││
│  └───────┬───────┘  └──────┬───────┘  └──────┬───────┘│
│          │                  │                  │        │
│          └──────────────────┼──────────────────┘        │
│                             ▼                           │
│                    ┌────────────────┐                   │
│                    │ Data Cleaner   │                   │
│                    │ (Pandas)       │                   │
│                    └────────┬───────┘                   │
└─────────────────────────────┼───────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│  AI Processing Layer (Claude API)                       │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Summarization │  │ Vote Extract │  │ Embedding    ││
│  │ (speeches)    │  │ (NLP)        │  │ Generation   ││
│  └───────┬───────┘  └──────┬───────┘  └──────┬───────┘│
│          │                  │                  │        │
└──────────┼──────────────────┼──────────────────┼────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│  Storage Layer (Supabase PostgreSQL)                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │ councillors | meetings | speeches | bills | votes │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ pgvector (speech embeddings for RAG)              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────┐
│  Application Layer (Next.js)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Public Pages │  │ Search       │  │ Chatbot      │ │
│  │ (SSR)        │  │ (Full-text)  │  │ (RAG)        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Subscription │  │ Admin Panel  │  │ Data Export  │ │
│  │ Management   │  │ (verification│  │ (CSV/JSON)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Development Roadmap (3 Phases)

### Phase 1: MVP - Foundation (Weeks 1-6)

**Goal:** 기본적인 의정 데이터 아카이빙 시스템 구축

#### Core Features

**1.1 의원 디지털 프로필**
- **기능:**
  - 의원별 페이지 (이름, 정당, 선거구, 소속 위원회)
  - 프로필 사진, 연락처, 사무실 위치
  - 현재 임기 정보
- **Data Source:** council.yongin.go.kr/kr/member/list.do
- **Tech:** Next.js SSR, Supabase Storage (이미지)

**1.2 회의록 아카이브**
- **기능:**
  - 전체 회의 목록 (본회의, 상임위원회별)
  - 회의별 상세 페이지 (날짜, 안건, 회의록 PDF 링크, 영상 링크)
  - 전문 검색 (회의록 텍스트 내 키워드 검색)
- **Data Source:** council.yongin.go.kr 회의록 페이지
- **Tech:** PostgreSQL full-text search, Tsvector

**1.3 법안 추적기**
- **기능:**
  - 조례안/의안 목록 (제안일, 제안자, 현재 상태)
  - 법안 상세 페이지 (전문, 발의 취지, 심사 경과)
  - 상태별 필터링 (발의/계류/가결/부결)
- **Data Source:** 회의록 및 의안 정보 스크래핑
- **Tech:** Python BeautifulSoup, Pandas

**1.4 데이터 스크래핑 파이프라인**
- **기능:**
  - 정기 자동 수집 (매일 새벽 2시)
  - 중복 체크 및 업데이트 로직
  - 에러 로깅 및 알림 (관리자에게 이메일)
- **Tech:** Python script + cron job (Vercel Cron Functions)
- **Challenge:**
  - council.yongin.go.kr의 HTML 구조 변경 대응
  - PDF 회의록 텍스트 추출 (PyPDF2)

#### Deliverables
- 의원 30명 프로필 수집
- 최근 1년 회의록 100건 이상 아카이빙
- 법안 50건 이상 추적
- 검색 가능한 웹사이트 (council-watch.vercel.app)

#### Success Metrics
- 페이지 로딩 속도 < 2초
- 검색 정확도 > 90%
- 데이터 수집 성공률 > 95%

---

### Phase 2: Accountability Engine (Weeks 7-12)

**Goal:** AI 기반 의정 활동 분석 시스템 구축 (핵심 차별화 포인트)

#### Core Features

**2.1 AI 발언 추출 & 요약**
- **기능:**
  - 회의록에서 의원별 발언 자동 추출
  - 발언당 3-5줄 AI 요약 생성
  - 핵심 키워드 자동 태깅 (예산, 교통, 환경 등)
  - 주제별 분류 (AI 기반)
- **Tech:**
  - Claude 3.5 Sonnet API (한국어 회의록 → 구조화된 JSON)
  - Prompt engineering for 의원명 파싱, 발언 경계 인식
  - pgvector로 임베딩 저장 (RAG 준비)
- **Challenge:**
  - 회의록 형식이 일관되지 않음 → 다양한 패턴 학습 필요
  - 의원명 표기 불일치 (예: "김철수 의원", "김철수", "김의원") → 정규화

**2.2 투표 기록 추출 (NLP + Human-in-the-loop)**
- **Critical Challenge:**
  - 용인시의회 공식 홈페이지에는 **구조화된 투표 기록이 없음**
  - 투표 결과가 회의록 텍스트에 산재 (예: "재석 27명, 찬성 25명으로 가결되었습니다")
  - 개별 의원의 찬성/반대 입장은 대부분 기록되지 않음 (거수 표결)

- **2단계 접근 방식:**

  **Step 1: AI 기반 1차 추출**
  - Claude API로 회의록 분석 → 표결 관련 문장 추출
  - 정규표현식 + NLP로 투표 결과 파싱
  - 신뢰도 점수 산출 (0-100%)

  **Step 2: 수작업 검증 시스템**
  - 관리자 대시보드에서 AI 추출 결과 검토
  - 원본 회의록 링크와 함께 표시
  - "검증 완료" 체크 후 공개
  - 검증되지 않은 데이터는 "미확인" 라벨 표시

- **Tech:**
  - Claude API (structured output)
  - 관리자 대시보드 (Next.js + Supabase Auth)
  - `is_verified` 플래그로 데이터 품질 관리

**2.3 의원별 통합 프로필 2.0**
- **추가 정보:**
  - 발언 이력 타임라인 (최신순)
  - 투표 성향 분석 (진보/보수, 시민단체 평가 연동 가능)
  - 주요 관심 분야 (발언 키워드 분석 기반)
  - 법안 발의 통계 (총 발의 건수, 가결률)
- **Visualization:**
  - 발언 키워드 워드 클라우드
  - 투표 성향 차트 (찬성/반대/기권 비율)
  - 위원회 활동 히트맵

**2.4 법안별 투표 현황**
- **기능:**
  - 법안 상세 페이지에 투표 결과 추가
  - 찬성/반대 의원 명단 (검증된 데이터만)
  - 정당별 투표 성향 시각화
- **제한사항 명시:**
  - "현재 용인시의회는 개별 투표 기록을 공개하지 않습니다. 본 데이터는 회의록 분석을 통해 추출되었으며, 모든 데이터는 출처를 명시합니다."

#### Deliverables
- 1,000개 이상 발언 AI 요약
- 100개 법안 투표 기록 (수작업 검증 완료)
- 의원별 분석 페이지 30개
- 관리자 검증 대시보드

#### Success Metrics
- AI 요약 품질 평가 (사람 평가) > 4/5점
- 투표 기록 정확도 > 98% (검증된 데이터)
- 발언 추출 재현율 > 90%

---

### Phase 3: Engagement & Investigation (Weeks 13-20)

**Goal:** 시민 참여 기능 + 데이터 저널리즘 프로젝트 런칭

#### Core Features

**3.1 지역구 의원 찾기**
- **기능:**
  - 주소 입력 → Naver Maps Geocoding API
  - 선거구 경계 매칭 (data.go.kr 선거구 데이터)
  - "내 의원" 페이지로 이동
  - 의원 연락처, 최근 활동 요약 표시
- **Tech:**
  - Naver Maps API
  - PostGIS (선거구 폴리곤 저장 및 Point-in-Polygon 쿼리)
- **UX:**
  - 모바일 최적화 (위치 정보 자동 입력 옵션)
  - 선거구 경계 지도 시각화

**3.2 알림 시스템 (이메일 기반)**
- **구독 유형:**
  1. **키워드 알림**: "교통", "학교급식" 등 키워드 등록 → 관련 발언/법안 발생 시 주간 다이제스트
  2. **의원 알림**: 특정 의원의 모든 활동 추적
  3. **법안 알림**: 관심 법안의 상태 변경 시 즉시 알림
- **Tech:**
  - Resend API (트랜잭션 이메일)
  - Supabase Edge Functions (알림 트리거)
  - 구독 관리 페이지 (Next.js)
- **Privacy:**
  - 이메일만 수집 (회원가입 불필요)
  - 언제든 구독 취소 가능 (one-click unsubscribe)

**3.3 AI 챗봇 (RAG 기반)**
- **기능:**
  - 자연어 질문: "김철수 의원이 지난 1년간 교통 예산에 찬성했나요?"
  - 답변 + 출처 링크 (회의록 페이지, 발언 날짜)
  - 후속 질문 가능 (대화형 인터페이스)
- **Tech:**
  - Supabase pgvector (speech 임베딩 검색)
  - Claude 3.5 Sonnet (RAG 답변 생성)
  - Prompt: "다음 회의록 발췌를 기반으로 답변하세요. 추측하지 말고, 문서에 명시된 내용만 답변하세요."
- **Limitation:**
  - "모든 답변은 공개된 회의록을 기반으로 합니다. AI가 생성한 답변이므로 원본 출처를 반드시 확인하세요."

**3.4 탐사 프로젝트: "세금 감시단" (신규 v2.0 기능)**

뉴스타파의 "국회 세금도둑 추적" 프로젝트에서 영감을 받아, 용인시의회 버전으로 구현:

**프로젝트 1: 해외출장 사용 내역 추적**
- **Data Sources:**
  - 용인시의회 예산서 (해외출장비 항목)
  - 회의록 (출장 보고서)
  - 정보공개청구 (필요 시)
- **Deliverables:**
  - 의원별 해외출장 횟수, 목적지, 비용 시각화 (인터랙티브 지도)
  - 출장 목적과 결과 보고서 연결
  - "1인당 평균 출장 비용" 순위
- **Visualization:**
  - D3.js 네트워크 그래프 (의원-목적지-예산)
  - 타임라인 차트

**프로젝트 2: 의정비 투명성 리포트**
- **Goal:** 의정비 사용 내역 시각화 (월정 수당, 활동비 등)
- **Data:** 용인시의회 예산 공개 자료
- **Output:**
  - 연간 리포트 (PDF + 웹페이지)
  - 타 지자체 의회와 비교 분석

**프로젝트 3: 개발 사업 추적**
- **Goal:** 대규모 개발 사업 관련 의원 발언 및 투표 패턴 분석
- **Method:**
  - "개발", "재개발", "도시계획" 키워드로 발언 추출
  - 찬성/반대 의원 네트워크 분석
  - 외부 언론 보도와 교차 검증
- **Output:**
  - 인터랙티브 대시보드 (사업별 의원 입장 매트릭스)

**탐사 프로젝트 공통 원칙:**
- **투명성**: 모든 데이터 출처 명시, 원본 링크 제공
- **중립성**: 정치적 판단 배제, 데이터만 제시
- **재사용성**: CSV/JSON 데이터 공개, API 제공 (Phase 3 후반)
- **시민 기여**: "이 데이터에 오류가 있나요?" 신고 기능

#### Deliverables
- 지역구 찾기 기능 (30개 선거구 매핑)
- 알림 시스템 (최소 100명 초기 구독자 확보)
- AI 챗봇 베타 런칭
- 탐사 프로젝트 1개 완성 (해외출장 추적)

#### Success Metrics
- 주간 활성 사용자 > 500명
- 이메일 구독자 > 200명
- 챗봇 질문 답변 정확도 > 85% (사용자 피드백)
- 탐사 프로젝트 언론 보도 1건 이상

---

## 5. Key Technical Challenges & Solutions

### Challenge 1: 투표 기록 부재

**Problem:** 용인시의회는 개별 의원의 투표 기록을 구조화된 형태로 제공하지 않음

**Solution:**
1. **단기 (Phase 2):**
   - AI + 수작업 검증 시스템 구축
   - 중요 법안부터 우선 검증 (예산안, 조례 개정안)
   - "미확인" 라벨로 데이터 품질 명시

2. **중기 (Phase 3 이후):**
   - 시민 검증 시스템 (Wikipedia 모델)
   - 다수 검증 시 "검증 완료" 상태 전환

3. **장기:**
   - 플랫폼 성공 시 → 시의회에 공식 데이터 공개 요청
   - TheyWorkForYou 선례: 플랫폼 입증 후 공공기관과 협력

### Challenge 2: 회의록 형식 불일치

**Problem:** 회의록 HTML/PDF 구조가 회의마다 다름

**Solution:**
- 다양한 패턴 학습 (정규표현식 + AI)
- Fallback 로직: AI 파싱 실패 시 원본 텍스트 그대로 저장
- 지속적인 모니터링 및 패턴 업데이트

### Challenge 3: 데이터 스크래핑 법적 리스크

**Problem:** council.yongin.go.kr 저작권 고지 존재

**Solution:**
1. **Fair Use 원칙:**
   - 비영리 공공 목적 (시민의 알 권리)
   - 원본 데이터 변형 (요약, 분석, 시각화)
   - 항상 출처 명시 및 원본 링크 제공

2. **선례:**
   - TheyWorkForYou (UK): 공식 API 없이 시작 → 성공 후 협력
   - 뉴스타파: 공공 데이터 재가공으로 탐사보도

3. **투명성:**
   - About 페이지에 데이터 출처 및 방법론 공개
   - 시의회 요청 시 협의 의향 명시

### Challenge 4: AI 비용 관리

**Problem:** Claude API 비용 (토큰당 과금)

**Solution:**
- **Optimization:**
  - 발언 요약 시 최대 토큰 제한 (입력 2000 토큰, 출력 200 토큰)
  - 배치 처리로 API 호출 최소화
  - 캐싱: 동일 회의록 재요약 방지
- **Cost Estimation:**
  - 1,000개 발언 요약 ≈ $10-20 (Claude 3.5 Sonnet 기준)
  - Phase 2 예상 비용: $50-100
- **Budget:**
  - 초기 MVP: 자비 or 소액 크라우드펀딩
  - Phase 3: 뉴스타파 모델 (시민 후원)

### Challenge 5: 개인정보보호

**Problem:** 알림 시스템 이메일 수집

**Solution:**
- GDPR/개인정보보호법 준수
- 최소 수집 (이메일만, 이름 불필요)
- 명확한 동의 절차 ("이 이메일은 알림 전송에만 사용됩니다")
- 언제든 삭제 요청 가능 (자동화)
- Supabase RLS (Row Level Security)로 데이터 접근 제한

---

## 6. Data Visualization Strategy

### 6.1 Core Visualizations

**의원 프로필 페이지:**
- 발언 키워드 워드 클라우드 (D3.js)
- 투표 성향 도넛 차트 (찬성/반대/기권 비율)
- 위원회 활동 타임라인

**법안 페이지:**
- 정당별 투표 성향 막대 그래프
- 법안 심사 프로세스 플로우차트

**탐사 프로젝트 페이지:**
- 해외출장 인터랙티브 지도 (Naver Maps + D3.js)
- 의원-사업 네트워크 그래프 (Force-directed graph)
- 예산 사용 트렌드 라인 차트 (Recharts)

### 6.2 Benchmark: 한국 데이터 저널리즘 수상작

**뉴스타파 "국회 세금도둑 추적":**
- 인터랙티브 테이블 (정렬, 필터링 가능)
- 의원별 상세 페이지 (클릭 시 드릴다운)
- 모바일 최적화

**JTBC "지역구 개발 사업 추적":**
- 지도 + 타임라인 결합
- 스크롤 내리면 스토리 전개 (Scrollytelling)

**적용 방향:**
- 정적 이미지 대신 인터랙티브 차트
- 모바일 터치 최적화 (확대/축소, 스와이프)
- 데이터 다운로드 버튼 (투명성)

---

## 7. Content Strategy & Sustainability

### 7.1 Launch Strategy

**Soft Launch (Phase 1 완료 시):**
- 지역 언론 보도자료 배포
- SNS (트위터, 페이스북 용인 커뮤니티)
- 시민단체 협력 (환경운동연합, 참여연대 지역 지부)

**Public Launch (Phase 3 완료 시):**
- 탐사 프로젝트 1개와 함께 공개
- 기자간담회 (데이터 저널리즘 성과 발표)
- 크라우드펀딩 캠페인 (뉴스타파 모델)

### 7.2 Community Building

**타겟 커뮤니티:**
- 지역 기자 (경기신문, 용인시민신문)
- 시민운동가 (환경, 교육, 교통 분야)
- 대학생 (용인대, 경희대 수원캠퍼스)
- 학부모 (교육 관련 이슈 관심)

**Engagement:**
- 월간 데이터 리포트 (뉴스레터)
- "이달의 발견" (가장 흥미로운 의정 데이터)
- 시민 제안 게시판 ("이런 데이터를 분석해 주세요")

### 7.3 Sustainability Model (장기)

**뉴스타파 벤치마킹:**
- **시민 후원 모델**: 월 정기 후원 (3,000원, 5,000원, 10,000원)
- **투명한 재정 공개**: 수입/지출 내역 공개 (연간 리포트)
- **비영리 독립성 유지**: 광고 없음, 정치 후원 거부

**수익 구조 (Phase 3 이후):**
1. 시민 후원 (목표: 월 200명 × 5,000원 = 100만원)
2. 재단 지원 (민주주의 관련 재단 그랜트)
3. 데이터 API 유료 서비스 (언론사, 연구기관 대상) - 제한적

**비용 구조:**
- 서버 비용: Vercel Pro ($20/월) + Supabase Pro ($25/월)
- AI API: 월 $50-100
- 도메인/이메일: 연 $100
- **총 월 운영비: 약 15-20만원** (시민 후원으로 충분히 충당 가능)

---

## 8. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 시의회 웹사이트 차단 | High | Low | robots.txt 준수, 스크래핑 간격 조정, 공식 협력 요청 |
| 투표 기록 부정확성 | High | Medium | 수작업 검증, 미확인 라벨, 출처 명시 |
| AI 환각(Hallucination) | Medium | Medium | 프롬프트 엔지니어링, 출처 링크 병기, 사용자 신고 기능 |
| 사용자 유입 부족 | High | Medium | 언론 보도, SNS 마케팅, 시민단체 협력 |
| 법적 분쟁 (저작권) | Medium | Low | Fair use 원칙, 변호사 자문, 협의 의향 명시 |
| 재정 지속성 | Medium | Medium | 시민 후원 모델, 크라우드펀딩, 재단 지원 |

---

## 9. Success Metrics (KPIs)

### Phase 1 (MVP)
- ✅ 의원 30명 프로필 수집
- ✅ 회의록 100건 아카이빙
- ✅ 법안 50건 추적
- ✅ 검색 기능 구현
- 📊 목표 방문자: 월 100명

### Phase 2 (Accountability)
- ✅ 발언 1,000개 AI 요약
- ✅ 투표 기록 100건 검증
- ✅ 의원별 분석 페이지 30개
- 📊 목표 방문자: 월 500명
- 📊 언론 보도: 1건 이상

### Phase 3 (Engagement)
- ✅ 이메일 구독자 200명
- ✅ AI 챗봇 베타 런칭
- ✅ 탐사 프로젝트 1개 완성
- 📊 목표 방문자: 월 2,000명
- 📊 언론 보도: 3건 이상
- 📊 SNS 팔로워: 500명 (트위터 + 페이스북)

### Long-term (6개월 후)
- 📊 월 활성 사용자(MAU): 5,000명
- 📊 시민 후원자: 200명
- 📊 타 지자체로 확장 (수원, 성남 등)

---

## 10. Ethical Guidelines

### 10.1 Non-partisanship
- 어떤 정당/의원도 우대하거나 폄하하지 않음
- 데이터는 있는 그대로 제시
- 편집자 코멘트 최소화 (팩트만 제공)

### 10.2 Transparency
- 모든 데이터 출처 명시
- AI 생성 콘텐츠 명확히 라벨링
- 오류 발견 시 즉시 수정 및 공지
- 재정 내역 공개 (수입/지출)

### 10.3 Privacy
- 의원은 공인이므로 공개된 정보 사용 가능
- 일반 시민 개인정보는 절대 수집하지 않음 (이메일 외)
- 댓글 기능 없음 (악플 방지)

### 10.4 Accountability
- 사용자 신고 기능 (데이터 오류, 윤리 위반)
- 독립 자문위원회 구성 (언론인, 법률가, 시민단체)
- 연간 투명성 리포트 발행

---

## 11. Technical Specifications

### 11.1 Frontend

**Framework:** Next.js 14 (App Router)

**Key Pages:**
```
/                          # 홈 (최신 회의, 인기 법안)
/councillors               # 의원 목록
/councillors/[id]          # 의원 상세 (발언, 투표)
/meetings                  # 회의록 아카이브
/meetings/[id]             # 회의 상세 (전문, 영상)
/bills                     # 법안 목록
/bills/[id]                # 법안 상세 (투표 기록)
/search                    # 통합 검색
/find-my-councillor        # 지역구 찾기
/investigations            # 탐사 프로젝트 목록
/investigations/[slug]     # 탐사 프로젝트 상세
/chatbot                   # AI 챗봇
/subscribe                 # 알림 구독
/about                     # 소개 (방법론, 팀)
```

**Styling:** Tailwind CSS
**Components:** shadcn/ui (Radix UI 기반)
**Charts:** Recharts, D3.js
**Maps:** Naver Maps JavaScript API

### 11.2 Backend

**Supabase Functions:**
- `scrape-councillors`: 의원 정보 수집 (daily cron)
- `scrape-meetings`: 회의록 수집 (daily cron)
- `summarize-speeches`: Claude API 호출 (queue 기반)
- `send-notifications`: 이메일 알림 발송 (weekly)

**Python Scripts (로컬 실행 or GitHub Actions):**
- `scraper.py`: BeautifulSoup + Playwright
- `pdf_parser.py`: PDF 회의록 텍스트 추출
- `vote_extractor.py`: 투표 기록 NLP 파싱

### 11.3 Third-party APIs

| API | Purpose | Cost |
|-----|---------|------|
| Anthropic Claude 3.5 Sonnet | 발언 요약, RAG 챗봇 | $3/MTok (input), $15/MTok (output) |
| Naver Maps Geocoding | 주소 → 좌표 | 무료 (일 5만 건) |
| data.go.kr | 선거구 경계 데이터 | 무료 |
| Resend | 이메일 발송 | 무료 (월 3,000통), Pro $20/월 |

### 11.4 Infrastructure

**Hosting:** Vercel (Pro Plan $20/월)
**Database:** Supabase (Pro Plan $25/월)
**Storage:** Supabase Storage (의원 프로필 이미지, 시각화 이미지)
**Monitoring:** Vercel Analytics + Sentry (에러 트래킹)
**CI/CD:** GitHub Actions (자동 배포, 테스트)

---

## 12. Open Questions & Future Research

1. **투표 기록 정확도 향상:**
   - 시의회에 공식 데이터 공개 요청할 적절한 시점은?
   - 시민 검증 시스템의 신뢰도를 어떻게 보장할 것인가?

2. **확장 가능성:**
   - 타 지자체로 확장 시 스크래핑 코드 재사용성은?
   - 전국 기초의회 통합 플랫폼 가능성은? (장기 비전)

3. **수익 모델:**
   - 시민 후원만으로 지속 가능한가?
   - 기업 후원을 받을 경우 독립성 유지 방안은?

4. **법적 리스크:**
   - 저작권 관련 법률 자문 필요
   - 공직선거법 위반 소지 검토 (선거 기간 중)

5. **AI 윤리:**
   - AI 요약의 편향성 모니터링 방법은?
   - 사용자가 AI를 과신하지 않도록 하는 UX 설계는?

---

## 13. References & Inspiration

### Platforms
- **TheyWorkForYou** (UK): https://www.theyworkforyou.com
- **뉴스타파 국회 세금도둑 추적**: https://newstapa.org
- **ProPublica Politwoops** (US): https://www.propublica.org

### Research
- "의정 감시 플랫폼의 민주주의 기여 연구" (참여연대, 2020)
- "데이터 저널리즘 방법론" (한국언론진흥재단, 2022)
- "지방의회 투명성 지수" (한국매니페스토실천본부, 2023)

### Tools & APIs
- Anthropic Claude API Docs: https://docs.anthropic.com
- Supabase pgvector Guide: https://supabase.com/docs/guides/ai
- Naver Maps API: https://navermaps.github.io/maps.js.ncp

---

## 14. Appendix: MVP Launch Checklist

### Pre-launch (Phase 1 완료 전)
- [ ] 의원 30명 데이터 수집 완료
- [ ] 회의록 100건 아카이빙
- [ ] 법안 50건 추적
- [ ] 검색 기능 테스트 (정확도 > 90%)
- [ ] 모바일 반응형 디자인 검증
- [ ] 페이지 로딩 속도 최적화 (< 2초)
- [ ] SEO 설정 (메타 태그, sitemap.xml)
- [ ] 법률 자문 (저작권, 개인정보보호법)
- [ ] About 페이지 작성 (방법론, 데이터 출처, 팀 소개)

### Launch Day
- [ ] 도메인 연결 (예: councilwatch-yongin.kr)
- [ ] Google Analytics 설정
- [ ] 보도자료 배포 (지역 언론 3곳 이상)
- [ ] SNS 계정 개설 (트위터, 페이스북)
- [ ] 첫 게시물: "이렇게 만들었습니다" (비하인드 스토리)

### Post-launch (첫 1개월)
- [ ] 사용자 피드백 수집 (구글 폼)
- [ ] 버그 수정 (Sentry 모니터링)
- [ ] 언론 보도 클리핑
- [ ] MAU 100명 달성
- [ ] Phase 2 개발 착수

---

**Document End**

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-15 | 초안 작성 (3-phase roadmap) | - |
| 2.0 | 2025-10-18 | 데이터 저널리즘 프레임워크 통합, 탐사 프로젝트 추가, 시각화 전략 구체화 | Claude Code |
