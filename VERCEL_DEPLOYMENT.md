# Vercel 배포 가이드

## 🚀 배포 체크리스트

### 1. 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

```
Project Settings > Environment Variables
```

**필수 환경 변수:**

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mopwsgknvcejfcmgeviv.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase anon 키 |

**중요:** 모든 환경(`Production`, `Preview`, `Development`)에 동일하게 설정하세요.

### 2. 빌드 설정 확인

Vercel은 `web/` 디렉토리의 Next.js 프로젝트를 자동으로 감지합니다.

**자동 설정 값:**
- **Framework Preset**: Next.js
- **Build Command**: `cd web && npm install && npm run build`
- **Output Directory**: `web/.next`
- **Install Command**: `cd web && npm install`

이 설정은 `vercel.json` 파일에 명시되어 있습니다.

### 3. 도메인 설정 (선택사항)

```
Project Settings > Domains
```

커스텀 도메인을 연결하려면:
1. 도메인 입력
2. DNS 레코드 추가
3. SSL 인증서 자동 발급 대기

## 🔧 문제 해결

### 404 NOT_FOUND 에러

**증상:** 메인 페이지가 404 에러

**원인:**
1. 환경 변수가 설정되지 않음
2. 빌드 실패
3. 잘못된 빌드 경로

**해결:**

#### 1단계: 환경 변수 확인
```bash
# Vercel Dashboard에서 확인
Settings > Environment Variables

# 두 변수가 모두 설정되었는지 확인
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 2단계: 빌드 로그 확인
```
Deployments > 최신 배포 클릭 > Building 탭

에러가 있는지 확인:
- TypeScript 에러
- 패키지 설치 실패
- 환경 변수 누락 경고
```

#### 3단계: 재배포
```bash
# Vercel Dashboard에서
Deployments > ... > Redeploy

# 또는 Git push
git add .
git commit -m "fix: Update deployment configuration"
git push
```

### 빌드는 성공하지만 페이지가 안 보임

**확인사항:**
1. Supabase에 데이터가 있는지 확인
2. RLS 정책이 올바른지 확인
3. Browser Console에서 에러 확인

### favicon.ico 404 에러

**원인:** 정상적인 현상입니다. Vercel이 favicon을 찾지 못해도 사이트는 정상 작동합니다.

**해결 (선택):**
```bash
# web/public/favicon.ico 파일 확인
ls web/public/

# 또는 app/favicon.ico 확인
ls web/src/app/favicon.ico
```

## 📊 배포 후 확인사항

### 1. 페이지 로딩 확인
- [ ] 메인 페이지 (`/`)
- [ ] 의원 목록 (`/councillors`)
- [ ] 회의록 목록 (`/meetings`)
- [ ] 의안 목록 (`/bills`)

### 2. 데이터 표시 확인
- [ ] 의원 31명 표시
- [ ] 회의록 30건 표시
- [ ] 의안 30건 표시

### 3. 기능 테스트
- [ ] 의원 필터링 (정당/지역구)
- [ ] 의원 상세 페이지 접근
- [ ] 회의록 상세 페이지 접근
- [ ] 의안 상세 페이지 접근

## 🔄 자동 배포

GitHub에 push하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "feat: Add new feature"
git push origin main
```

**배포 프로세스:**
1. GitHub push 감지
2. Vercel이 자동으로 빌드 시작
3. 빌드 성공 시 자동 배포
4. Preview URL 생성
5. Production 도메인 업데이트

## 📈 성능 모니터링

### Vercel Analytics
```
Dashboard > Analytics

확인 가능 항목:
- 페이지 뷰
- 고유 방문자
- 평균 로딩 시간
- Core Web Vitals
```

### Speed Insights
```
Dashboard > Speed Insights

확인 가능 항목:
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
```

## 🆘 추가 도움

### Vercel 문서
- [Next.js 배포 가이드](https://vercel.com/docs/frameworks/nextjs)
- [환경 변수 설정](https://vercel.com/docs/environment-variables)
- [커스텀 도메인](https://vercel.com/docs/custom-domains)

### 프로젝트 문서
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 가이드
- [README.md](./README.md) - 프로젝트 소개
- [QUICKSTART.md](./QUICKSTART.md) - 빠른 시작 가이드

---

**마지막 업데이트:** 2025-10-16
