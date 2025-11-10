# 🎉 Supabase → PocketBase 마이그레이션 자동화 완료

## 📦 생성된 파일 목록

### 1. 종합 가이드 문서
- **`POCKETBASE_MIGRATION_GUIDE.md`** (58 KB)
  - 전체 마이그레이션 프로세스 상세 설명
  - Supabase 스키마 분석
  - PocketBase 컬렉션 설계
  - 코드 수정 가이드
  - 트러블슈팅

### 2. 마이그레이션 스크립트 (`migration-scripts/`)

#### 실행 스크립트 (Node.js)
- **`1-export-supabase-data.js`** - Supabase 데이터 Export
- **`2-import-to-pocketbase.js`** - PocketBase 데이터 Import
- **`3-migrate-images.js`** - 이미지 파일 마이그레이션
- **`package.json`** - 의존성 및 실행 명령

#### 문서
- **`README.md`** - 스크립트 사용 설명서
- **`USAGE_EXAMPLES.md`** - PocketBase 코드 예시 모음

### 3. Next.js 통합 파일 (`web/src/`)

- **`lib/pocketbase/client.ts`** - PocketBase 클라이언트 초기화
- **`types/pocketbase-types.ts`** - TypeScript 타입 정의

---

## 🚀 빠른 시작 가이드

### Step 1: PocketBase 컬렉션 생성 (수동)

PocketBase Admin UI에서 6개 컬렉션을 생성하세요:

```
https://theyworkforcitizen-api.duckdns.org/_/
```

**필수 컬렉션:**
1. ✅ councillors
2. ✅ committees
3. ✅ councillor_committees
4. ✅ meetings
5. ✅ bills
6. ✅ bill_cosponsors

**상세 필드 정의:** `migration-scripts/README.md` 참조

### Step 2: 환경 변수 설정

```bash
# 터미널에서 설정
export POCKETBASE_ADMIN_EMAIL="your-admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="your-password"
export NEXT_PUBLIC_POCKETBASE_URL="https://theyworkforcitizen-api.duckdns.org"
```

### Step 3: 마이그레이션 스크립트 실행

```bash
cd migration-scripts

# 의존성 설치
npm install

# 전체 마이그레이션 자동 실행
npm run migrate-all
```

**또는 단계별 실행:**
```bash
npm run export    # Supabase Export
npm run import    # PocketBase Import
npm run images    # 이미지 마이그레이션
```

### Step 4: Next.js 코드 수정

```bash
cd ../web

# Supabase 의존성 제거 + PocketBase 추가
npm uninstall @supabase/ssr @supabase/supabase-js
npm install pocketbase

# .env.local 수정
# SUPABASE → POCKETBASE 환경 변수로 변경
```

**변경 예시:**
```diff
- NEXT_PUBLIC_SUPABASE_URL=...
- NEXT_PUBLIC_SUPABASE_ANON_KEY=...
+ NEXT_PUBLIC_POCKETBASE_URL=https://theyworkforcitizen-api.duckdns.org
```

### Step 5: Vercel 환경 변수 업데이트

Vercel Dashboard:
1. 프로젝트 Settings → Environment Variables
2. 기존 Supabase 변수 **삭제**
3. `NEXT_PUBLIC_POCKETBASE_URL` **추가**

### Step 6: 배포

```bash
git add .
git commit -m "Migrate from Supabase to PocketBase"
git push origin main
```

Vercel이 자동으로 배포합니다.

---

## 📊 스크립트 기능 상세

### 1-export-supabase-data.js

**기능:**
- ✅ Supabase 데이터베이스의 모든 테이블 Export
- ✅ JSON 형식 (구조 보존)
- ✅ CSV 형식 (Excel 호환)
- ✅ 통계 파일 생성
- ✅ Phase 2/3 테이블 자동 감지

**출력 위치:** `exports/` 디렉토리

**출력 파일:**
- `councillors.json` / `councillors.csv`
- `committees.json` / `committees.csv`
- `councillor_committees.json` / `.csv`
- `meetings.json` / `meetings.csv`
- `bills.json` / `bills.csv`
- `bill_cosponsors.json` / `.csv`
- `_export_stats.json` (통계)

**실행 시간:** 30초 ~ 1분

### 2-import-to-pocketbase.js

**기능:**
- ✅ Admin 자동 인증
- ✅ 컬렉션 존재 여부 검증
- ✅ Foreign Key → Relation 자동 변환
- ✅ Supabase UUID → PocketBase ID 매핑 저장
- ✅ 에러 발생 시 계속 진행 (부분 실패 허용)

**출력 파일:**
- `exports/id_mapping.json` (UUID ↔ PB ID 매핑)

**실행 시간:** 1 ~ 2분

### 3-migrate-images.js

**기능:**
- ✅ Supabase Storage URL에서 이미지 다운로드
- ✅ PocketBase File Field로 업로드
- ✅ Rate limiting (서버 보호)
- ✅ 실패한 파일 로그 출력

**대상:** 의원 프로필 사진 (31명)

**실행 시간:** 1 ~ 2분

---

## 🔧 생성된 Helper 함수

### PocketBase 클라이언트 (`lib/pocketbase/client.ts`)

```typescript
import { pocketbase, getCouncillorPhotoUrl } from '@/lib/pocketbase/client';

// 싱글톤 인스턴스
const pb = pocketbase;

// 파일 URL 생성
const photoUrl = getCouncillorPhotoUrl(record.id, record.photo);
```

### TypeScript 타입 (`types/pocketbase-types.ts`)

```typescript
import type {
  Councillor,
  CouncillorExpanded,
  Bill,
  BillExpanded
} from '@/types/pocketbase-types';

// 타입 안전한 데이터 Fetch
const councillor = await pb.collection('councillors')
  .getOne<CouncillorExpanded>(id, { expand: '...' });
```

---

## 📖 코드 사용 예시

### Before (Supabase)

```typescript
const { data, error } = await supabase
  .from('councillors')
  .select('*')
  .eq('is_active', true);

if (error) throw error;
```

### After (PocketBase)

```typescript
const councillors = await pocketbase
  .collection('councillors')
  .getFullList({ filter: 'is_active = true' });
```

**더 많은 예시:** `migration-scripts/USAGE_EXAMPLES.md` 참조

---

## ✅ 검증 체크리스트

### 마이그레이션 후 확인 사항

- [ ] **데이터 Export 성공**
  - `exports/` 디렉토리에 JSON/CSV 파일 생성 확인
  - `_export_stats.json`에서 레코드 수 확인

- [ ] **PocketBase Import 성공**
  - PocketBase Admin UI에서 레코드 수 확인
  - Supabase와 레코드 수 일치 여부 확인

- [ ] **이미지 마이그레이션 성공**
  - 의원 레코드의 `photo` 필드에 파일명 존재
  - 브라우저에서 이미지 URL 접근 가능

- [ ] **Next.js 코드 수정 완료**
  - `package.json`에 `pocketbase` 의존성 존재
  - `@supabase/*` 의존성 제거됨
  - `.env.local`에 PocketBase 환경 변수 설정
  - 모든 페이지 코드가 PocketBase SDK 사용

- [ ] **로컬 테스트 성공**
  - `npm run dev` 실행
  - 의원 목록 페이지 정상 표시
  - 의원 상세 페이지 정상 표시
  - 이미지 로딩 확인

- [ ] **Vercel 배포 성공**
  - 환경 변수 설정 완료
  - 빌드 성공
  - Production URL 접속 확인

---

## 🎯 예상 마이그레이션 시간

| 단계 | 소요 시간 | 비고 |
|------|-----------|------|
| **수동 작업** | | |
| 1. PocketBase 컬렉션 생성 | 30분 ~ 1시간 | Admin UI 사용 |
| **자동 스크립트** | | |
| 2. 데이터 Export | 30초 ~ 1분 | 자동 |
| 3. 데이터 Import | 1 ~ 2분 | 자동 |
| 4. 이미지 마이그레이션 | 1 ~ 2분 | 자동 |
| **코드 수정** | | |
| 5. Next.js 코드 수정 | 2 ~ 3시간 | 모든 페이지 리팩토링 |
| 6. 로컬 테스트 | 30분 | 기능 검증 |
| 7. Vercel 배포 | 15분 | 환경 변수 + Git push |
| 8. Production 테스트 | 30분 | 최종 검증 |
| **총 예상 시간** | **5 ~ 8시간** | 한 번에 진행 시 |

---

## 💰 비용 비교

### Before (Supabase)

| 항목 | 비용 | 비고 |
|------|------|------|
| 무료 플랜 | $0 | 2개 프로젝트까지 |
| 추가 프로젝트 | $25/월 | 프로젝트당 |
| **3개 프로젝트 총** | **$25/월** | |

### After (PocketBase on VPS)

| 항목 | 비용 | 비고 |
|------|------|------|
| Vultr VPS | $6/월 | 1 CPU, 1GB RAM, 25GB SSD |
| DuckDNS | $0 | 무료 동적 DNS |
| Caddy | $0 | 무료 SSL 자동 갱신 |
| **총** | **$6/월** | 무제한 프로젝트 |

**절감액:** $19/월 ($228/년)

---

## 🔒 보안 고려사항

### Admin 계정 보안

- ✅ 강력한 비밀번호 사용
- ✅ 환경 변수로 관리 (코드에 하드코딩 금지)
- ✅ Production 환경에서만 Admin API 사용

### API Rules 설정

- ✅ 공개 데이터: "List/View" → Allow all
- ✅ 비공개 작업: "Create/Update/Delete" → Admins only

### HTTPS 강제

- ✅ Caddy가 자동으로 HTTPS 리다이렉션 적용
- ✅ Let's Encrypt 인증서 자동 갱신

---

## 📚 참고 문서

### 생성된 문서
1. **`POCKETBASE_MIGRATION_GUIDE.md`** - 종합 가이드
2. **`migration-scripts/README.md`** - 스크립트 사용법
3. **`migration-scripts/USAGE_EXAMPLES.md`** - 코드 예시
4. **`MIGRATION_COMPLETE.md`** (현재 문서) - 작업 요약

### 외부 리소스
- **PocketBase Docs:** https://pocketbase.io/docs/
- **PocketBase JS SDK:** https://github.com/pocketbase/js-sdk
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

## 🎓 다음 단계

### 즉시 실행 가능
1. ✅ 마이그레이션 스크립트 실행
2. ✅ Next.js 코드 수정
3. ✅ Vercel 배포

### Phase 2 준비 (AI 기능)
- speeches (발언 기록) 컬렉션 추가
- votes (표결 기록) 컬렉션 추가
- Claude API 연동

### Phase 3 준비 (고급 기능)
- 사용자 인증 (PocketBase Auth)
- 알림 구독 시스템
- RAG 챗봇 (Qdrant/Weaviate)

---

## 🙋 질문 & 지원

### 문제 발생 시

1. **트러블슈팅 가이드 확인**
   - `POCKETBASE_MIGRATION_GUIDE.md` 섹션 8 참조

2. **로그 확인**
   - 스크립트 실행 시 출력된 에러 메시지 확인
   - PocketBase 서버 로그: `ssh root@158.247.210.200; journalctl -u pocketbase -f`

3. **재시도**
   - 대부분의 에러는 재실행으로 해결됩니다
   - PocketBase 데이터 삭제 후 재Import

---

## ✨ 작업 완료 요약

### 생성된 리소스

- 📄 **4개의 종합 문서** (120+ KB)
- 🛠️ **3개의 자동화 스크립트** (JavaScript/Node.js)
- 📦 **2개의 Next.js Helper 파일** (TypeScript)
- 📊 **1개의 package.json** (의존성 관리)

### 예상 성과

- ⚡ **페이지 로딩 속도 향상** (Cold start 제거)
- 💰 **월 $19 비용 절감**
- 🚀 **무제한 프로젝트 운영 가능**
- 🔧 **완전한 백엔드 제어권 확보**

---

**마이그레이션 준비 완료!** 🎉

이제 `migration-scripts/` 디렉토리로 이동하여 스크립트를 실행하세요.

```bash
cd migration-scripts
npm install
npm run migrate-all
```

Good luck! 🚀

---

**작성일:** 2025년 11월 10일
**작성자:** Claude Code AI
**문서 버전:** 1.0
**프로젝트:** 그들은 용인시민을 위해 일합니다
