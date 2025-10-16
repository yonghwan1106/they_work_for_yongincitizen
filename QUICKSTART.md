# 빠른 시작 가이드

이 가이드는 프로젝트를 최대한 빨리 실행하고 테스트할 수 있도록 도와줍니다.

## ⏱️ 5분 안에 실행하기

### 1단계: Supabase 설정 (2분)

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트 생성
2. SQL Editor 열기
3. `supabase/schema.sql` 내용 복사 → 붙여넣기 → Run
4. `supabase/sample_data.sql` 내용 복사 → 붙여넣기 → Run
5. Project Settings > API에서 키 복사

### 2단계: 환경 변수 설정 (1분)

`web/.env.local` 파일 생성:
```bash
NEXT_PUBLIC_SUPABASE_URL=여기에_프로젝트_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
```

### 3단계: 웹 서버 실행 (2분)

```bash
cd web
npm install  # 첫 실행 시에만
npm run dev
```

브라우저에서 http://localhost:3000 접속!

## ✅ 확인 사항

실행 후 다음을 확인하세요:

### 홈페이지 (http://localhost:3000)
- [x] 히어로 섹션 표시
- [x] 주요 기능 카드 3개
- [x] 통계 섹션

### 의원 페이지 (/councillors)
- [x] 6명의 샘플 의원 표시
- [x] 정당별 필터 작동
- [x] 의원 카드 클릭 시 상세 페이지 이동

### 의원 상세 페이지 (/councillors/[id])
- [x] 의원 프로필 정보
- [x] 통계 (발의 의안, 발언, 표결)
- [x] 대표 발의 의안 목록
- [x] 최근 발언 목록
- [x] 표결 기록

### 회의록 페이지 (/meetings)
- [x] 5건의 회의록 표시
- [x] 회의 유형별 필터
- [x] 검색 기능

### 의안 페이지 (/bills)
- [x] 5건의 의안 표시
- [x] 상태별, 유형별 필터
- [x] 발의자 정보 표시

## 🔧 문제 해결

### "데이터를 불러오는 중 오류가 발생했습니다"
→ `.env.local` 파일 확인
→ Supabase 프로젝트 URL과 키가 정확한지 확인

### "등록된 의원 정보가 없습니다"
→ Supabase SQL Editor에서 `sample_data.sql` 실행했는지 확인
→ SQL 실행 후 성공 메시지 확인

### 개발 서버가 시작되지 않음
→ Node.js 18 이상 설치 확인: `node --version`
→ `web` 디렉토리에서 실행 중인지 확인

## 📚 다음 단계

샘플 데이터로 프로젝트를 확인했다면:

1. **실제 데이터 수집**: `scraper/` 디렉토리의 README 참조
2. **커스터마이징**: 컴포넌트 수정, 스타일링 변경
3. **배포**: Vercel에 배포하기

## 💡 팁

- 개발 중 코드 변경사항은 자동으로 반영됩니다 (Hot Reload)
- Supabase Dashboard의 Table Editor에서 데이터 직접 수정 가능
- 브라우저 개발자 도구의 콘솔에서 에러 확인

## 🆘 도움이 필요하신가요?

- [프로젝트 README](./README.md) 전체 문서
- [Supabase 가이드](./supabase/README.md)
- [Next.js 공식 문서](https://nextjs.org/docs)
