# Migration Scripts - Supabase to PocketBase

이 디렉토리에는 Supabase에서 PocketBase로 데이터를 마이그레이션하는 자동화 스크립트가 있습니다.

## 📋 사전 준비

### 1. PocketBase 컬렉션 생성

먼저 PocketBase Admin UI에서 다음 컬렉션을 생성해야 합니다:

1. **PocketBase Admin 접속**
   - URL: `https://theyworkforcitizen-api.duckdns.org/_/`
   - Admin 계정으로 로그인

2. **컬렉션 생성 순서** (중요: 순서대로!)

   ① **councillors** (의원 정보)
   ```
   Fields:
   - name (Text, Required)
   - name_en (Text)
   - councillor_type (Select: 국회의원, 경기도의원, 용인시의원)
   - party (Text)
   - district (Text)
   - photo (File, Max 1 file, Max size 5MB)
   - term_number (Number)
   - is_active (Bool, Default: true)
   - email (Email)
   - phone (Text)
   - office_location (Text)
   - profile_url (URL)

   API Rules:
   - List/View: Allow all
   - Create/Update/Delete: Admins only
   ```

   ② **committees** (위원회 정보)
   ```
   Fields:
   - name (Text, Required)
   - name_en (Text)
   - type (Select: 상임위원회, 특별위원회)
   - description (Editor)

   API Rules:
   - List/View: Allow all
   - Create/Update/Delete: Admins only
   ```

   ③ **councillor_committees** (의원-위원회 관계)
   ```
   Fields:
   - councillor (Relation → councillors, Cascade delete)
   - committee (Relation → committees, Cascade delete)
   - role (Select: 위원장, 부위원장, 위원)
   - start_date (Date)
   - end_date (Date)

   API Rules:
   - List/View: Allow all
   - Create/Update/Delete: Admins only
   ```

   ④ **meetings** (회의 정보)
   ```
   Fields:
   - title (Text, Required)
   - meeting_type (Select: 본회의, 상임위원회, 특별위원회)
   - committee (Relation → committees)
   - meeting_date (Date, Required)
   - session_number (Number)
   - meeting_number (Number)
   - transcript_url (URL)
   - video_url (URL)
   - transcript_text (Editor)
   - is_processed (Bool, Default: false)

   API Rules:
   - List/View: Allow all
   - Create/Update/Delete: Admins only
   ```

   ⑤ **bills** (의안 정보)
   ```
   Fields:
   - bill_number (Text, Required, Unique)
   - title (Text, Required)
   - bill_type (Select: 조례안, 예산안, 동의안, 결의안)
   - proposer (Relation → councillors)
   - proposal_date (Date)
   - status (Select: 발의, 상정, 가결, 부결, 폐기)
   - result (Select: 원안가결, 수정가결, 부결)
   - summary (Editor)
   - full_text (Editor)
   - bill_url (URL)

   API Rules:
   - List/View: Allow all
   - Create/Update/Delete: Admins only
   ```

   ⑥ **bill_cosponsors** (의안 공동발의자)
   ```
   Fields:
   - bill (Relation → bills, Cascade delete)
   - councillor (Relation → councillors, Cascade delete)

   API Rules:
   - List/View: Allow all
   - Create/Update/Delete: Admins only
   ```

### 2. 환경 변수 설정

#### Supabase 환경 변수 (이미 설정되어 있음)

`web/.env.local` 파일에 다음 변수가 있어야 합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mopwsgknvcejfcmgeviv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

#### PocketBase Admin 환경 변수 (새로 설정 필요)

터미널에서 다음 명령으로 설정:

**Linux/Mac:**
```bash
export POCKETBASE_ADMIN_EMAIL="your-admin-email@example.com"
export POCKETBASE_ADMIN_PASSWORD="your-admin-password"
export NEXT_PUBLIC_POCKETBASE_URL="https://theyworkforcitizen-api.duckdns.org"
```

**Windows (PowerShell):**
```powershell
$env:POCKETBASE_ADMIN_EMAIL="your-admin-email@example.com"
$env:POCKETBASE_ADMIN_PASSWORD="your-admin-password"
$env:NEXT_PUBLIC_POCKETBASE_URL="https://theyworkforcitizen-api.duckdns.org"
```

**또는 `.env.local` 파일에 추가:**
```env
POCKETBASE_ADMIN_EMAIL=your-admin-email@example.com
POCKETBASE_ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_POCKETBASE_URL=https://theyworkforcitizen-api.duckdns.org
```

### 3. 의존성 설치

```bash
cd migration-scripts
npm install
```

---

## 🚀 마이그레이션 실행

### 자동 실행 (전체 과정)

```bash
cd migration-scripts
npm run migrate-all
```

이 명령은 다음 3단계를 순차적으로 실행합니다:
1. Supabase 데이터 Export
2. PocketBase로 Import
3. 이미지 파일 마이그레이션

### 수동 실행 (단계별)

각 단계를 개별적으로 실행할 수 있습니다:

#### 1단계: Supabase 데이터 Export

```bash
npm run export
# 또는
node 1-export-supabase-data.js
```

**결과:**
- `exports/councillors.json` 및 `.csv` 생성
- `exports/committees.json` 및 `.csv` 생성
- `exports/councillor_committees.json` 및 `.csv` 생성
- `exports/meetings.json` 및 `.csv` 생성
- `exports/bills.json` 및 `.csv` 생성
- `exports/bill_cosponsors.json` 및 `.csv` 생성
- `exports/_export_stats.json` (통계)

**예상 소요 시간:** 30초 ~ 1분

#### 2단계: PocketBase Import

```bash
npm run import
# 또는
node 2-import-to-pocketbase.js
```

**수행 작업:**
- Admin 인증
- 컬렉션 존재 여부 확인
- 데이터 Import (순서: councillors → committees → 관계 테이블)
- Supabase UUID → PocketBase ID 매핑 저장 (`exports/id_mapping.json`)

**예상 소요 시간:** 1 ~ 2분

#### 3단계: 이미지 마이그레이션

```bash
npm run images
# 또는
node 3-migrate-images.js
```

**수행 작업:**
- Supabase Storage에서 의원 사진 다운로드
- PocketBase File Field로 업로드
- 각 의원 레코드에 파일 연결

**예상 소요 시간:** 1 ~ 2분 (31명 기준)

---

## 📊 스크립트 상세 설명

### 1-export-supabase-data.js

**기능:**
- Supabase 데이터베이스의 모든 테이블을 JSON/CSV 형식으로 Export
- Phase 1/2/3 테이블 자동 감지
- 빈 테이블도 처리 (빈 배열로 저장)

**출력:**
- JSON 파일 (데이터 구조 보존)
- CSV 파일 (Excel에서 확인 가능)
- 통계 파일 (Export 결과 요약)

**에러 처리:**
- 테이블이 존재하지 않으면 스킵 (Phase 2/3 미구현 시)
- 네트워크 에러 재시도

### 2-import-to-pocketbase.js

**기능:**
- PocketBase Admin API를 통한 데이터 Import
- Foreign Key 관계를 Relation 필드로 변환
- Supabase UUID → PocketBase ID 매핑 자동 생성

**ID 매핑:**
```json
{
  "councillors": {
    "8f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c": "abc123def456",
    "...": "..."
  },
  "committees": { ... },
  "bills": { ... }
}
```

**에러 처리:**
- 중복 데이터 감지 (bill_number unique 제약)
- 누락된 Relation ID 처리
- 부분 실패 시 계속 진행

### 3-migrate-images.js

**기능:**
- Supabase Storage URL에서 이미지 다운로드
- PocketBase File Field로 업로드
- Rate limiting (서버 보호)

**지원 형식:**
- JPG, PNG, WebP
- 최대 5MB

**에러 처리:**
- 404 에러 (사진 없음) → 스킵
- 다운로드 실패 → 재시도 없음 (수동 처리)
- 업로드 실패 → 로그 출력

---

## 🔍 검증 방법

### 1. Export 검증

```bash
# Export된 파일 확인
ls -lh exports/

# 데이터 수 확인
cat exports/_export_stats.json

# 특정 테이블 미리보기
head -20 exports/councillors.json
```

### 2. Import 검증

**PocketBase Admin UI:**
1. `https://theyworkforcitizen-api.duckdns.org/_/` 접속
2. Collections → `councillors` 클릭
3. 레코드 수 확인 (Supabase와 비교)
4. 각 필드 데이터 확인

**API 직접 호출:**
```bash
# 의원 목록 조회
curl https://theyworkforcitizen-api.duckdns.org/api/collections/councillors/records

# 특정 의원 조회 (Relation expand)
curl "https://theyworkforcitizen-api.duckdns.org/api/collections/councillors/records/abc123?expand=councillor_committees_via_councillor.committee"
```

### 3. 이미지 검증

**PocketBase Admin UI:**
1. Collections → `councillors` → 특정 레코드 클릭
2. "photo" 필드에 파일명 표시 확인
3. 파일명 클릭 → 이미지 미리보기

**브라우저에서 직접 접근:**
```
https://theyworkforcitizen-api.duckdns.org/api/files/councillors/{record-id}/{filename}
```

---

## ⚠️ 주의사항

### 데이터 무결성

1. **Foreign Key 처리**
   - Supabase의 UUID가 PocketBase의 15자 ID로 자동 변환됩니다
   - `id_mapping.json`을 삭제하지 마세요 (참조용)

2. **중복 실행**
   - Import 스크립트를 여러 번 실행하면 중복 데이터가 생성됩니다
   - 재실행 전 PocketBase에서 데이터 삭제 필요

3. **Relation 순서**
   - councillors, committees 먼저 Import
   - 관계 테이블 (councillor_committees 등) 나중에 Import

### PocketBase 제약사항

1. **Vector 필드 미지원**
   - `speech_embeddings` 테이블은 별도 솔루션 필요 (Qdrant/Weaviate)

2. **Full-text Search 약함**
   - 한국어 형태소 분석 없음
   - 대안: Typesense/Meilisearch 추가

3. **파일 크기 제한**
   - 기본 5MB (설정 변경 가능)
   - 대용량 파일은 별도 스토리지 사용

---

## 🐛 트러블슈팅

### Error: "Collection not found"

**원인:** PocketBase 컬렉션이 생성되지 않음

**해결:**
1. PocketBase Admin UI에서 컬렉션 생성
2. 스크립트 재실행

### Error: "Admin authentication failed"

**원인:** 잘못된 Admin 계정 정보

**해결:**
```bash
# 환경 변수 확인
echo $POCKETBASE_ADMIN_EMAIL
echo $POCKETBASE_ADMIN_PASSWORD

# 다시 설정
export POCKETBASE_ADMIN_EMAIL="correct-email"
export POCKETBASE_ADMIN_PASSWORD="correct-password"
```

### Error: "ECONNREFUSED" (연결 거부)

**원인:** PocketBase 서버가 실행되지 않음

**해결:**
```bash
# VPS 접속
ssh root@158.247.210.200

# PocketBase 상태 확인
systemctl status pocketbase

# 재시작
systemctl restart pocketbase
```

### 이미지 업로드 실패 (403 Forbidden)

**원인:** API Rule에서 Create 권한 없음

**해결:**
1. PocketBase Admin → Collections → `councillors`
2. "API rules" → "Create" → "Admins only" 설정
3. 스크립트 재실행

### 일부 데이터만 Import됨

**정상 동작입니다!**
- Phase 2/3 테이블은 Supabase에 데이터가 없을 수 있습니다
- `_export_stats.json` 확인하여 실제 데이터 유무 체크

---

## 📝 다음 단계

마이그레이션이 완료되면:

1. **Next.js 코드 수정**
   - `POCKETBASE_MIGRATION_GUIDE.md` 섹션 5 참조
   - Supabase SDK → PocketBase SDK 교체

2. **Vercel 환경 변수 설정**
   - Supabase 변수 삭제
   - `NEXT_PUBLIC_POCKETBASE_URL` 추가

3. **배포 및 테스트**
   - 로컬 테스트 (`npm run dev`)
   - Vercel 배포 (`git push`)

---

## 📚 참고 자료

- **PocketBase Docs:** https://pocketbase.io/docs/
- **PocketBase JS SDK:** https://github.com/pocketbase/js-sdk
- **Supabase Docs:** https://supabase.com/docs
- **Migration Guide:** `../POCKETBASE_MIGRATION_GUIDE.md`

---

**작성일:** 2025년 11월 10일
**작성자:** Claude Code AI
**버전:** 1.0
