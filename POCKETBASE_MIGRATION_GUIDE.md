# PocketBase 마이그레이션 가이드

## 1. 개요

이 문서는 "그들은 용인시민을 위해 일합니다" 프로젝트를 Supabase에서 PocketBase로 마이그레이션하는 전체 과정을 안내합니다.

### 마이그레이션 목표
- ✅ Vultr VPS에 PocketBase 설치 완료 (IP: 158.247.210.200)
- ✅ Caddy 리버스 프록시 설정 완료 (HTTPS 자동 적용)
- ✅ PocketBase API Endpoint: `https://theyworkforcitizen-api.duckdns.org`
- ✅ PocketBase Admin: `https://theyworkforcitizen-api.duckdns.org/_/`
- 🔄 Supabase → PocketBase 데이터 마이그레이션
- 🔄 Next.js 코드 수정 (Supabase SDK → PocketBase SDK)

---

## 2. Supabase 데이터베이스 구조 분석

### Phase 1 - 핵심 테이블 (현재 사용 중)

#### 2.1 councillors (의원 정보)
```sql
- id: UUID (Primary Key)
- name: VARCHAR(100) - 이름
- name_en: VARCHAR(100) - 영문 이름
- councillor_type: VARCHAR(20) - 의원 유형 (국회의원/경기도의원/용인시의원)
- party: VARCHAR(50) - 정당
- district: VARCHAR(100) - 선거구
- photo_url: TEXT - 사진 URL
- term_number: INTEGER - 대수
- is_active: BOOLEAN - 활동 중 여부
- email: VARCHAR(100)
- phone: VARCHAR(50)
- office_location: VARCHAR(200)
- profile_url: TEXT - 공식 프로필 링크
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2.2 committees (위원회 정보)
```sql
- id: UUID
- name: VARCHAR(200) - 위원회명
- name_en: VARCHAR(200)
- type: VARCHAR(50) - 상임/특별위원회
- description: TEXT
- created_at: TIMESTAMPTZ
```

#### 2.3 councillor_committees (의원-위원회 관계)
```sql
- id: UUID
- councillor_id: UUID (Foreign Key → councillors)
- committee_id: UUID (Foreign Key → committees)
- role: VARCHAR(50) - 위원장/부위원장/위원
- start_date: DATE
- end_date: DATE
- created_at: TIMESTAMPTZ
```

#### 2.4 meetings (회의 정보)
```sql
- id: UUID
- title: VARCHAR(300)
- meeting_type: VARCHAR(100) - 본회의/상임위/특별위
- committee_id: UUID (Foreign Key)
- meeting_date: DATE
- session_number: INTEGER - 회기
- meeting_number: INTEGER - 차수
- transcript_url: TEXT - 회의록 URL
- video_url: TEXT - 영상 URL
- transcript_text: TEXT - 회의록 전문
- is_processed: BOOLEAN - AI 처리 완료 여부
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2.5 bills (의안 정보)
```sql
- id: UUID
- bill_number: VARCHAR(50) UNIQUE
- title: VARCHAR(500)
- bill_type: VARCHAR(100) - 조례안/예산안 등
- proposer_id: UUID (Foreign Key → councillors)
- proposal_date: DATE
- status: VARCHAR(50) - 발의/상정/가결/부결
- result: VARCHAR(50) - 원안가결/수정가결/부결
- summary: TEXT
- full_text: TEXT
- bill_url: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2.6 bill_cosponsors (의안 공동발의자)
```sql
- id: UUID
- bill_id: UUID (Foreign Key → bills)
- councillor_id: UUID (Foreign Key → councillors)
- created_at: TIMESTAMPTZ
```

### Phase 2 - AI/분석 테이블 (향후 구현 예정)

#### 2.7 speeches (발언 기록)
```sql
- id: UUID
- meeting_id: UUID (Foreign Key)
- councillor_id: UUID (Foreign Key)
- speech_order: INTEGER
- speech_text: TEXT
- summary: TEXT - AI 요약
- keywords: TEXT[] - AI 키워드
- timestamp_start: INTEGER
- timestamp_end: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2.8 votes (표결 기록)
```sql
- id: UUID
- bill_id: UUID (Foreign Key)
- councillor_id: UUID (Foreign Key)
- vote_cast: VARCHAR(20) - 찬성/반대/기권
- is_verified: BOOLEAN
- verified_by: VARCHAR(100)
- verified_at: TIMESTAMPTZ
- source_meeting_id: UUID
- created_at: TIMESTAMPTZ
```

### Phase 3 - 사용자/알림 테이블 (향후 구현 예정)
- district_mapping (선거구 매핑)
- user_profiles (사용자 프로필)
- subscriptions (알림 구독)
- notification_logs (알림 로그)
- chat_history (AI 채팅 기록)
- speech_embeddings (RAG 임베딩)

---

## 3. PocketBase 컬렉션 설계

### 3.1 핵심 차이점
| 항목 | Supabase | PocketBase |
|------|----------|------------|
| ID 타입 | UUID | 15자 랜덤 문자열 |
| 타임스탬프 | TIMESTAMPTZ | ISO 8601 문자열 |
| 인증 | auth.users 테이블 | _pb_users_ 컬렉션 |
| 관계 | Foreign Key | Relation 필드 |
| 배열 | TEXT[] | JSON 배열 |
| 파일 | Storage 버킷 | File 필드 |

### 3.2 PocketBase 컬렉션 생성 계획

#### Collection 1: councillors
```javascript
{
  name: "councillors",
  type: "base",
  schema: [
    { name: "name", type: "text", required: true },
    { name: "name_en", type: "text" },
    { name: "councillor_type", type: "select", options: {
      values: ["국회의원", "경기도의원", "용인시의원"]
    }},
    { name: "party", type: "text" },
    { name: "district", type: "text" },
    { name: "photo", type: "file", options: { maxSelect: 1, maxSize: 5242880 } }, // 5MB
    { name: "term_number", type: "number" },
    { name: "is_active", type: "bool", default: true },
    { name: "email", type: "email" },
    { name: "phone", type: "text" },
    { name: "office_location", type: "text" },
    { name: "profile_url", type: "url" }
  ]
}
```

#### Collection 2: committees
```javascript
{
  name: "committees",
  type: "base",
  schema: [
    { name: "name", type: "text", required: true },
    { name: "name_en", type: "text" },
    { name: "type", type: "select", options: {
      values: ["상임위원회", "특별위원회"]
    }},
    { name: "description", type: "editor" } // Rich text support
  ]
}
```

#### Collection 3: councillor_committees
```javascript
{
  name: "councillor_committees",
  type: "base",
  schema: [
    { name: "councillor", type: "relation", options: {
      collectionId: "councillors",
      cascadeDelete: true
    }},
    { name: "committee", type: "relation", options: {
      collectionId: "committees",
      cascadeDelete: true
    }},
    { name: "role", type: "select", options: {
      values: ["위원장", "부위원장", "위원"]
    }},
    { name: "start_date", type: "date" },
    { name: "end_date", type: "date" }
  ]
}
```

#### Collection 4: meetings
```javascript
{
  name: "meetings",
  type: "base",
  schema: [
    { name: "title", type: "text", required: true },
    { name: "meeting_type", type: "select", options: {
      values: ["본회의", "상임위원회", "특별위원회"]
    }},
    { name: "committee", type: "relation", options: {
      collectionId: "committees"
    }},
    { name: "meeting_date", type: "date", required: true },
    { name: "session_number", type: "number" },
    { name: "meeting_number", type: "number" },
    { name: "transcript_url", type: "url" },
    { name: "video_url", type: "url" },
    { name: "transcript_text", type: "editor" }, // Large text
    { name: "is_processed", type: "bool", default: false }
  ],
  indexes: ["CREATE INDEX idx_meeting_date ON meetings (meeting_date DESC)"]
}
```

#### Collection 5: bills
```javascript
{
  name: "bills",
  type: "base",
  schema: [
    { name: "bill_number", type: "text", required: true, unique: true },
    { name: "title", type: "text", required: true },
    { name: "bill_type", type: "select", options: {
      values: ["조례안", "예산안", "동의안", "결의안"]
    }},
    { name: "proposer", type: "relation", options: {
      collectionId: "councillors"
    }},
    { name: "proposal_date", type: "date" },
    { name: "status", type: "select", options: {
      values: ["발의", "상정", "가결", "부결", "폐기"]
    }},
    { name: "result", type: "select", options: {
      values: ["원안가결", "수정가결", "부결"]
    }},
    { name: "summary", type: "editor" },
    { name: "full_text", type: "editor" },
    { name: "bill_url", type: "url" }
  ],
  indexes: ["CREATE INDEX idx_bill_date ON bills (proposal_date DESC)"]
}
```

#### Collection 6: bill_cosponsors
```javascript
{
  name: "bill_cosponsors",
  type: "base",
  schema: [
    { name: "bill", type: "relation", options: {
      collectionId: "bills",
      cascadeDelete: true
    }},
    { name: "councillor", type: "relation", options: {
      collectionId: "councillors",
      cascadeDelete: true
    }}
  ]
}
```

---

## 4. 마이그레이션 실행 단계

### 4.1 데이터 Export (Supabase에서)

**Option A: Supabase Dashboard 사용**
1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `mopwsgknvcejfcmgeviv`
3. Table Editor → 각 테이블 선택
4. 우측 상단 "Export" → "CSV" 선택
5. 다음 순서로 Export 실행:
   - ✅ `councillors.csv`
   - ✅ `committees.csv`
   - ✅ `councillor_committees.csv`
   - ✅ `meetings.csv`
   - ✅ `bills.csv`
   - ✅ `bill_cosponsors.csv`

**Option B: SQL Query 사용 (터미널)**
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 링크
cd they_work_for_yongincitizen
supabase link --project-ref mopwsgknvcejfcmgeviv

# 데이터 Export (PostgreSQL COPY 명령 사용)
supabase db dump --data-only > data_backup.sql
```

**Option C: Node.js 스크립트 사용**
```javascript
// scripts/export-supabase-data.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://mopwsgknvcejfcmgeviv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) throw error;

  fs.writeFileSync(
    `./exports/${tableName}.json`,
    JSON.stringify(data, null, 2)
  );
  console.log(`✅ Exported ${data.length} rows from ${tableName}`);
}

async function main() {
  const tables = [
    'councillors',
    'committees',
    'councillor_committees',
    'meetings',
    'bills',
    'bill_cosponsors'
  ];

  for (const table of tables) {
    await exportTable(table);
  }
}

main();
```

실행:
```bash
cd they_work_for_yongincitizen
mkdir -p exports
node scripts/export-supabase-data.js
```

### 4.2 PocketBase 컬렉션 생성

**방법 1: Admin UI 사용 (권장)**

1. PocketBase Admin 접속: `https://theyworkforcitizen-api.duckdns.org/_/`
2. "Collections" → "New collection" 클릭
3. 위의 3.2절 설계대로 순서대로 생성:
   - ① `councillors` (먼저 생성)
   - ② `committees` (먼저 생성)
   - ③ `councillor_committees` (Relation 설정)
   - ④ `meetings` (Relation 설정)
   - ⑤ `bills` (Relation 설정)
   - ⑥ `bill_cosponsors` (Relation 설정)

**각 컬렉션 생성 시 주의사항:**
- ✅ "API Rules" → "List/View" → "Allow all" (공개 읽기)
- ✅ "API Rules" → "Create/Update/Delete" → "Admins only"
- ✅ Relation 필드는 대상 컬렉션이 먼저 존재해야 함
- ✅ File 필드 (photo)는 "Max size: 5MB" 설정

**방법 2: PocketBase API 사용 (자동화)**

```javascript
// scripts/create-pocketbase-collections.js
const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://theyworkforcitizen-api.duckdns.org');

// Admin 로그인
await pb.admins.authWithPassword(
  'admin@example.com',
  'your-admin-password'
);

// 컬렉션 생성 예시
const collectionData = {
  name: "councillors",
  type: "base",
  schema: [
    { name: "name", type: "text", required: true },
    { name: "councillor_type", type: "select", options: {
      maxSelect: 1,
      values: ["국회의원", "경기도의원", "용인시의원"]
    }},
    // ... 나머지 필드
  ]
};

await pb.collections.create(collectionData);
```

### 4.3 데이터 Import (PocketBase로)

**방법 1: Admin UI 사용 (CSV)**

1. PocketBase Admin → 컬렉션 선택
2. "Import" 버튼 클릭
3. CSV 파일 업로드
4. 컬럼 매핑 확인
5. "Import" 실행

**⚠️ 주의사항:**
- Relation 필드는 **대상 레코드 ID**로 매핑 필요
- Supabase UUID → PocketBase ID 변환 필요
- 파일 필드 (photo_url)는 별도 업로드 후 매핑

**방법 2: Node.js 스크립트 사용 (JSON)**

```javascript
// scripts/import-to-pocketbase.js
const PocketBase = require('pocketbase/cjs');
const fs = require('fs');

const pb = new PocketBase('https://theyworkforcitizen-api.duckdns.org');

// Admin 로그인
await pb.admins.authWithPassword(
  process.env.POCKETBASE_ADMIN_EMAIL,
  process.env.POCKETBASE_ADMIN_PASSWORD
);

// ID 매핑 저장 (Supabase UUID → PocketBase ID)
const idMap = {
  councillors: {},
  committees: {},
  bills: {}
};

// 1. councillors 먼저 Import
const councillorsData = JSON.parse(
  fs.readFileSync('./exports/councillors.json', 'utf8')
);

for (const councillor of councillorsData) {
  const pbData = {
    name: councillor.name,
    name_en: councillor.name_en,
    councillor_type: councillor.councillor_type,
    party: councillor.party,
    district: councillor.district,
    // photo는 URL → 파일 다운로드 → 업로드 필요
    term_number: councillor.term_number,
    is_active: councillor.is_active,
    email: councillor.email,
    phone: councillor.phone,
    office_location: councillor.office_location,
    profile_url: councillor.profile_url
  };

  try {
    const record = await pb.collection('councillors').create(pbData);
    idMap.councillors[councillor.id] = record.id;
    console.log(`✅ Imported councillor: ${councillor.name}`);
  } catch (error) {
    console.error(`❌ Error importing ${councillor.name}:`, error);
  }
}

// 2. committees Import
// ... (위와 동일한 패턴)

// 3. Relation 데이터 Import (ID 매핑 사용)
const billsData = JSON.parse(
  fs.readFileSync('./exports/bills.json', 'utf8')
);

for (const bill of billsData) {
  const pbData = {
    bill_number: bill.bill_number,
    title: bill.title,
    bill_type: bill.bill_type,
    proposer: idMap.councillors[bill.proposer_id], // UUID → PB ID
    proposal_date: bill.proposal_date,
    status: bill.status,
    result: bill.result,
    summary: bill.summary,
    full_text: bill.full_text,
    bill_url: bill.bill_url
  };

  const record = await pb.collection('bills').create(pbData);
  idMap.bills[bill.id] = record.id;
}

// ID 매핑 저장 (참조용)
fs.writeFileSync(
  './exports/id_mapping.json',
  JSON.stringify(idMap, null, 2)
);
```

실행:
```bash
node scripts/import-to-pocketbase.js
```

### 4.4 이미지 파일 마이그레이션

```javascript
// scripts/migrate-councillor-photos.js
const PocketBase = require('pocketbase/cjs');
const axios = require('axios');
const FormData = require('form-data');

const pb = new PocketBase('https://theyworkforcitizen-api.duckdns.org');
await pb.admins.authWithPassword(...);

const councillors = JSON.parse(
  fs.readFileSync('./exports/councillors.json', 'utf8')
);
const idMap = JSON.parse(
  fs.readFileSync('./exports/id_mapping.json', 'utf8')
);

for (const councillor of councillors) {
  if (!councillor.photo_url) continue;

  try {
    // Supabase Storage에서 이미지 다운로드
    const response = await axios.get(councillor.photo_url, {
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    const filename = councillor.photo_url.split('/').pop();

    // PocketBase에 업로드
    const formData = new FormData();
    formData.append('photo', buffer, filename);

    const pbId = idMap.councillors[councillor.id];
    await pb.collection('councillors').update(pbId, formData);

    console.log(`✅ Uploaded photo for ${councillor.name}`);
  } catch (error) {
    console.error(`❌ Error uploading photo for ${councillor.name}:`, error);
  }
}
```

---

## 5. Next.js 코드 수정

### 5.1 의존성 변경

**제거:**
```json
{
  "dependencies": {
    "@supabase/ssr": "^0.7.0",
    "@supabase/supabase-js": "^2.75.0"
  }
}
```

**추가:**
```json
{
  "dependencies": {
    "pocketbase": "^0.21.0"
  }
}
```

실행:
```bash
cd web
npm uninstall @supabase/ssr @supabase/supabase-js
npm install pocketbase
```

### 5.2 환경 변수 변경

**`.env.local` 파일 수정:**

**Before (Supabase):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://mopwsgknvcejfcmgeviv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**After (PocketBase):**
```env
NEXT_PUBLIC_POCKETBASE_URL=https://theyworkforcitizen-api.duckdns.org
```

**⚠️ 중요:** PocketBase는 anon key가 필요 없습니다! API Rules에서 공개 읽기를 허용했기 때문입니다.

### 5.3 클라이언트 초기화 코드 변경

**Before: `lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**After: `lib/pocketbase/client.ts`**
```typescript
import PocketBase from 'pocketbase';

// 싱글톤 패턴
let pb: PocketBase;

export function getPocketBase(): PocketBase {
  if (!pb) {
    pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

    // Auto-cancel 설정 (요청 중복 방지)
    pb.autoCancellation(false);
  }
  return pb;
}

export const pocketbase = getPocketBase();
```

### 5.4 데이터 Fetch 코드 변경 예시

#### 예시 1: 의원 목록 조회

**Before (Supabase):**
```typescript
// src/app/councillors/page.tsx
import { supabase } from '@/lib/supabase/client';

export default async function CouncillorsPage() {
  const { data: councillors, error } = await supabase
    .from('councillors')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  return <CouncillorsList councillors={councillors} />;
}
```

**After (PocketBase):**
```typescript
// src/app/councillors/page.tsx
import { pocketbase } from '@/lib/pocketbase/client';

export default async function CouncillorsPage() {
  const councillors = await pocketbase
    .collection('councillors')
    .getFullList({
      filter: 'is_active = true',
      sort: 'name'
    });

  return <CouncillorsList councillors={councillors} />;
}
```

#### 예시 2: 의원 상세 + Relation 조회

**Before (Supabase):**
```typescript
// src/app/councillors/[id]/page.tsx
const { data: councillor, error } = await supabase
  .from('councillors')
  .select(`
    *,
    councillor_committees (
      role,
      committee:committees (
        name,
        type
      )
    ),
    bills!proposer_id (
      bill_number,
      title,
      status
    )
  `)
  .eq('id', params.id)
  .single();
```

**After (PocketBase):**
```typescript
// src/app/councillors/[id]/page.tsx
const councillor = await pocketbase
  .collection('councillors')
  .getOne(params.id, {
    expand: 'councillor_committees_via_councillor.committee'
    // PocketBase는 자동으로 역참조(reverse relation) 생성
  });

// 별도로 제안한 의안 조회 (필터 사용)
const bills = await pocketbase
  .collection('bills')
  .getList(1, 50, {
    filter: `proposer = "${params.id}"`,
    sort: '-proposal_date'
  });
```

#### 예시 3: 검색 쿼리

**Before (Supabase):**
```typescript
const { data } = await supabase
  .from('meetings')
  .select('*')
  .textSearch('title', searchQuery, { type: 'websearch' })
  .limit(20);
```

**After (PocketBase):**
```typescript
const meetings = await pocketbase
  .collection('meetings')
  .getList(1, 20, {
    filter: `title ~ "${searchQuery}"` // SQL LIKE 연산자
  });
```

#### 예시 4: Create/Update (Admin 전용)

**Before (Supabase):**
```typescript
// scripts/add-councillor.ts
const { data, error } = await supabase
  .from('councillors')
  .insert({
    name: '홍길동',
    party: '무소속',
    // ...
  });
```

**After (PocketBase):**
```typescript
// scripts/add-councillor.ts
import { pocketbase } from '@/lib/pocketbase/client';

// Admin 인증 (한 번만 실행)
await pocketbase.admins.authWithPassword(
  process.env.POCKETBASE_ADMIN_EMAIL!,
  process.env.POCKETBASE_ADMIN_PASSWORD!
);

const record = await pocketbase
  .collection('councillors')
  .create({
    name: '홍길동',
    party: '무소속',
    // ...
  });
```

### 5.5 TypeScript 타입 정의 변경

**Before: `src/types/database.ts` (Supabase 자동 생성)**
```typescript
export type Councillor = Database['public']['Tables']['councillors']['Row'];
```

**After: `src/types/pocketbase-types.ts` (수동 정의 또는 생성)**

```typescript
// Option A: 수동 정의
export interface Councillor {
  id: string;
  name: string;
  name_en?: string;
  councillor_type: '국회의원' | '경기도의원' | '용인시의원';
  party?: string;
  district?: string;
  photo?: string; // PocketBase 파일 필드는 파일명만 저장
  term_number?: number;
  is_active: boolean;
  email?: string;
  phone?: string;
  office_location?: string;
  profile_url?: string;
  created: string; // ISO 8601
  updated: string;
}

export interface Committee {
  id: string;
  name: string;
  name_en?: string;
  type?: '상임위원회' | '특별위원회';
  description?: string;
  created: string;
  updated: string;
}

export interface Bill {
  id: string;
  bill_number: string;
  title: string;
  bill_type?: '조례안' | '예산안' | '동의안' | '결의안';
  proposer: string; // Relation ID
  proposal_date?: string;
  status?: '발의' | '상정' | '가결' | '부결' | '폐기';
  result?: '원안가결' | '수정가결' | '부결';
  summary?: string;
  full_text?: string;
  bill_url?: string;
  created: string;
  updated: string;
}

// Expanded relation 타입
export interface BillExpanded extends Bill {
  expand?: {
    proposer?: Councillor;
  };
}
```

**Option B: 자동 생성 (pocketbase-typegen 사용)**
```bash
npm install -g pocketbase-typegen

# PocketBase 스키마에서 TypeScript 타입 생성
pocketbase-typegen \
  --url https://theyworkforcitizen-api.duckdns.org \
  --email admin@example.com \
  --password your-password \
  --out src/types/pocketbase-types.ts
```

### 5.6 파일 URL 처리 변경

**PocketBase 파일 URL 생성:**
```typescript
// Before (Supabase Storage)
const photoUrl = supabase.storage
  .from('councillor-photos')
  .getPublicUrl(councillor.photo_url).data.publicUrl;

// After (PocketBase File Field)
const photoUrl = councillor.photo
  ? pocketbase.files.getUrl(councillor, councillor.photo)
  : '/default-avatar.png';

// URL 형식: https://theyworkforcitizen-api.duckdns.org/api/files/councillors/{record-id}/{filename}
```

### 5.7 수정이 필요한 파일 목록

다음 파일들을 순서대로 수정하세요:

1. ✅ `web/.env.local` - 환경 변수
2. ✅ `web/package.json` - 의존성
3. ✅ `web/src/lib/pocketbase/client.ts` - 클라이언트 초기화 (새 파일)
4. ✅ `web/src/types/pocketbase-types.ts` - TypeScript 타입 (새 파일)
5. 🔄 `web/src/app/councillors/page.tsx` - 의원 목록
6. 🔄 `web/src/app/councillors/[id]/page.tsx` - 의원 상세
7. 🔄 `web/src/app/meetings/page.tsx` - 회의 목록
8. 🔄 `web/src/app/bills/page.tsx` - 의안 목록
9. 🔄 `scraper/utils/db.py` - Python 스크레이퍼 (PocketBase REST API 사용)

---

## 6. Vercel 환경 변수 설정

### 6.1 Vercel Dashboard에서 설정

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택: `they-work-for-yongincitizen`
3. "Settings" → "Environment Variables"
4. 기존 Supabase 변수 **삭제**:
   - ❌ `NEXT_PUBLIC_SUPABASE_URL`
   - ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ❌ `SUPABASE_SERVICE_ROLE_KEY`

5. 새 PocketBase 변수 **추가**:
   - ✅ **Key:** `NEXT_PUBLIC_POCKETBASE_URL`
   - ✅ **Value:** `https://theyworkforcitizen-api.duckdns.org`
   - ✅ **Environments:** Production, Preview, Development (모두 체크)

6. (선택) Admin 작업용 변수 추가 (비공개):
   - ✅ **Key:** `POCKETBASE_ADMIN_EMAIL`
   - ✅ **Value:** (PocketBase 관리자 이메일)
   - ✅ **Environments:** Production only

   - ✅ **Key:** `POCKETBASE_ADMIN_PASSWORD`
   - ✅ **Value:** (PocketBase 관리자 비밀번호)
   - ✅ **Environments:** Production only

7. "Save" 클릭

### 6.2 Vercel CLI로 설정 (대안)

```bash
vercel env add NEXT_PUBLIC_POCKETBASE_URL production
# 입력: https://theyworkforcitizen-api.duckdns.org

vercel env add NEXT_PUBLIC_POCKETBASE_URL preview
# 입력: https://theyworkforcitizen-api.duckdns.org

vercel env add NEXT_PUBLIC_POCKETBASE_URL development
# 입력: https://theyworkforcitizen-api.duckdns.org
```

---

## 7. 배포 및 테스트

### 7.1 로컬 테스트

```bash
cd web

# 환경 변수 확인
cat .env.local

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
# http://localhost:3000
# http://localhost:3000/councillors
# http://localhost:3000/councillors/[어떤-id]
```

**테스트 체크리스트:**
- [ ] 의원 목록이 표시되는가?
- [ ] 의원 상세 페이지가 로드되는가?
- [ ] 의원 사진이 표시되는가?
- [ ] 위원회 정보가 올바르게 expand 되는가?
- [ ] 검색 기능이 작동하는가?
- [ ] 빌드가 성공하는가? (`npm run build`)

### 7.2 Vercel 배포

**방법 1: Git Push (자동 배포)**
```bash
cd they_work_for_yongincitizen

git add .
git commit -m "Migrate from Supabase to PocketBase

- Remove Supabase dependencies
- Add PocketBase SDK
- Update environment variables
- Refactor data fetching logic
- Update TypeScript types"

git push origin main
```

Vercel이 자동으로 감지하여 배포 시작합니다.

**방법 2: Vercel CLI (수동 배포)**
```bash
cd web
vercel --prod
```

### 7.3 Production 테스트

배포 완료 후:
1. Vercel 배포 URL 접속: `https://they-work-for-yongincitizen.vercel.app`
2. 위의 로컬 테스트 체크리스트를 동일하게 실행
3. Chrome DevTools → Network 탭에서 API 호출 확인:
   - `https://theyworkforcitizen-api.duckdns.org/api/collections/councillors/records`

### 7.4 성능 비교

**Before (Supabase):**
- 의원 목록 로딩: ~300ms
- 의원 상세 + Relation: ~500ms
- Cold start 패널티: 있음 (무료 플랜)

**After (PocketBase):**
- 의원 목록 로딩: ~200ms (예상)
- 의원 상세 + Relation: ~350ms (예상)
- Cold start 패널티: 없음 (VPS 24/7 가동)

---

## 8. 주의사항 및 트러블슈팅

### 8.1 CORS 에러 발생 시

PocketBase는 기본적으로 CORS를 허용하지만, 특정 Vercel 도메인만 허용하려면:

**PocketBase 설정 파일 수정 (VPS SSH 접속):**
```bash
ssh root@158.247.210.200

# PocketBase 설정 파일
nano /opt/pocketbase/pb_data/data.db
```

또는 **Caddy에서 CORS 헤더 추가:**
```caddyfile
theyworkforcitizen-api.duckdns.org {
  reverse_proxy localhost:8090

  # CORS 헤더 추가
  header {
    Access-Control-Allow-Origin "https://they-work-for-yongincitizen.vercel.app"
    Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    Access-Control-Allow-Headers "Content-Type, Authorization"
  }
}
```

### 8.2 Relation 데이터가 안 나올 때

**증상:** `councillor.expand` is undefined

**원인:** `expand` 파라미터를 빼먹음

**해결:**
```typescript
// ❌ Wrong
const councillor = await pocketbase
  .collection('councillors')
  .getOne(id);
console.log(councillor.expand); // undefined!

// ✅ Correct
const councillor = await pocketbase
  .collection('councillors')
  .getOne(id, {
    expand: 'councillor_committees_via_councillor.committee'
  });
console.log(councillor.expand); // { ... }
```

### 8.3 파일 업로드가 안 될 때

**증상:** 403 Forbidden on file upload

**원인:** API Rule에서 Create 권한이 없음

**해결:**
1. PocketBase Admin → Collections → `councillors`
2. "API rules" → "Create" → "Admins only"로 설정
3. 스크립트에서 Admin 인증 후 업로드:

```typescript
await pocketbase.admins.authWithPassword(
  process.env.POCKETBASE_ADMIN_EMAIL!,
  process.env.POCKETBASE_ADMIN_PASSWORD!
);

// 이제 파일 업로드 가능
const formData = new FormData();
formData.append('photo', photoFile);
await pocketbase.collection('councillors').create(formData);
```

### 8.4 검색이 느릴 때

**PocketBase는 full-text search가 약함**

**해결책 1: 인덱스 추가 (SQL)**
```sql
-- PocketBase Admin → Settings → "Import collections"
CREATE INDEX idx_councillors_name ON councillors (name);
CREATE INDEX idx_bills_title ON bills (title);
```

**해결책 2: 클라이언트 사이드 필터링 (소규모 데이터)**
```typescript
// 전체 데이터 가져오기
const allCouncillors = await pocketbase
  .collection('councillors')
  .getFullList();

// 클라이언트에서 필터링
const filtered = allCouncillors.filter(c =>
  c.name.includes(searchQuery) || c.district?.includes(searchQuery)
);
```

**해결책 3: Typesense/Meilisearch 추가 (Phase 3)**
- 향후 검색 전용 엔진 연동 고려

### 8.5 VPS 디스크 용량 부족

**증상:** PocketBase가 데이터를 저장하지 못함

**확인:**
```bash
ssh root@158.247.210.200
df -h
```

**해결:**
```bash
# PocketBase 데이터 정리
cd /opt/pocketbase/pb_data
du -sh *

# 불필요한 백업 삭제
rm -rf backups/*
```

---

## 9. Phase 2/3 마이그레이션 가이드 (향후)

### 9.1 AI/분석 테이블 (speeches, votes)

**추가 컬렉션 생성:**
- `speeches` (발언 기록)
- `votes` (표결 기록)
- `speech_embeddings` (RAG 벡터)

**PocketBase의 한계:**
- ❌ Vector 필드 지원 안 함 (pgvector 대체 필요)
- ✅ 대안: Qdrant/Weaviate 별도 구축 또는 Supabase 부분 유지

### 9.2 사용자 인증 (auth.users)

**Supabase Auth → PocketBase Auth 마이그레이션:**

PocketBase는 자체 인증 시스템 제공:
- `_pb_users_` 컬렉션 자동 생성
- 이메일 인증, OAuth 지원

**마이그레이션 방법:**
1. 기존 Supabase 사용자 Export
2. PocketBase User Collection으로 Import
3. 비밀번호는 재설정 링크 전송 (해시 호환 안 됨)

---

## 10. 체크리스트

### Phase 1 마이그레이션 완료 기준

- [ ] **1. Supabase 데이터 Export 완료**
  - [ ] councillors.csv (또는 .json)
  - [ ] committees.csv
  - [ ] councillor_committees.csv
  - [ ] meetings.csv
  - [ ] bills.csv
  - [ ] bill_cosponsors.csv

- [ ] **2. PocketBase 컬렉션 생성 완료**
  - [ ] councillors (with photo field)
  - [ ] committees
  - [ ] councillor_committees (with relations)
  - [ ] meetings
  - [ ] bills (with proposer relation)
  - [ ] bill_cosponsors

- [ ] **3. PocketBase 데이터 Import 완료**
  - [ ] councillors (31명 확인)
  - [ ] committees
  - [ ] councillor_committees
  - [ ] meetings
  - [ ] bills
  - [ ] bill_cosponsors
  - [ ] 이미지 파일 업로드 완료

- [ ] **4. Next.js 코드 수정 완료**
  - [ ] package.json 의존성 변경
  - [ ] .env.local 환경 변수 변경
  - [ ] lib/pocketbase/client.ts 생성
  - [ ] types/pocketbase-types.ts 생성
  - [ ] 모든 페이지 코드 리팩토링 완료
  - [ ] 로컬 빌드 성공 (`npm run build`)

- [ ] **5. Vercel 배포 완료**
  - [ ] 환경 변수 설정 완료
  - [ ] Git push → 자동 배포 성공
  - [ ] Production URL 접속 확인
  - [ ] 의원 목록/상세 페이지 정상 작동
  - [ ] 이미지 로딩 확인

- [ ] **6. 구 Supabase 프로젝트 정리**
  - [ ] 데이터 백업 보관 확인
  - [ ] Supabase 프로젝트 Pause (비용 절감)
  - [ ] (선택) 완전 삭제

---

## 11. 추가 리소스

### 공식 문서
- **PocketBase Docs:** https://pocketbase.io/docs/
- **PocketBase JS SDK:** https://github.com/pocketbase/js-sdk
- **Vercel Deployment:** https://vercel.com/docs/deployments/overview

### 유용한 도구
- **pocketbase-typegen:** TypeScript 타입 자동 생성
- **PocketBase Admin UI:** 웹 기반 데이터베이스 관리
- **Insomnia/Postman:** PocketBase REST API 테스트

### 커뮤니티
- **PocketBase Discord:** https://discord.gg/pocketbase
- **PocketBase GitHub Discussions:** https://github.com/pocketbase/pocketbase/discussions

---

## 12. 마이그레이션 타임라인 (예상)

| 단계 | 예상 시간 | 비고 |
|------|-----------|------|
| 1. 데이터 Export | 30분 | Supabase Dashboard 수동 또는 스크립트 |
| 2. PocketBase 컬렉션 생성 | 1시간 | Admin UI 수동 또는 API 자동화 |
| 3. 데이터 Import | 1시간 | 스크립트 작성 + 실행 + 검증 |
| 4. 이미지 마이그레이션 | 30분 | 31명 의원 사진 업로드 |
| 5. Next.js 코드 수정 | 2-3시간 | 모든 페이지 리팩토링 |
| 6. 로컬 테스트 | 30분 | 기능 검증 |
| 7. Vercel 배포 | 15분 | 환경 변수 + Git push |
| 8. Production 테스트 | 30분 | 최종 검증 |
| **총 예상 시간** | **6-7시간** | 한 번에 진행 시 |

---

## 문의 사항

마이그레이션 과정에서 문제가 발생하면:
1. 이 문서의 "8. 주의사항 및 트러블슈팅" 참조
2. PocketBase 공식 문서 확인
3. GitHub Issues에 질문 남기기

---

**마지막 업데이트:** 2025년 11월 10일
**작성자:** Claude Code AI
**문서 버전:** 1.0
