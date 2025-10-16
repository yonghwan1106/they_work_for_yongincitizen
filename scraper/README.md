# Yongin Council Data Scraper

용인특례시의회 웹사이트에서 의원, 회의록, 의안 정보를 수집하는 Python 스크레이퍼입니다.

## 설정

### 1. Python 가상환경 생성 및 활성화

```bash
cd scraper
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고 실제 값을 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일에서 다음 값들을 설정:
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_KEY`: Supabase 서비스 역할 키 (service_role key)
- `ANTHROPIC_API_KEY`: Claude API 키 (Phase 2에서 사용)

## 사용 방법

### 전체 데이터 수집

```bash
python main.py --target all
```

### 특정 데이터만 수집

```bash
# 의원 정보만 수집
python main.py --target councillors

# 회의록만 수집
python main.py --target meetings

# 의안 정보만 수집
python main.py --target bills
```

## 구조

```
scraper/
├── main.py                 # 메인 실행 파일
├── config.py              # 설정 및 환경 변수
├── requirements.txt       # Python 패키지 의존성
├── scrapers/
│   ├── councillors.py    # 의원 정보 스크레이퍼
│   ├── meetings.py       # 회의록 스크레이퍼
│   └── bills.py          # 의안 정보 스크레이퍼
└── utils/
    └── db.py             # Supabase 데이터베이스 유틸리티
```

## 개발 상태

현재 스크레이퍼는 **템플릿 상태**입니다. 실제 작동을 위해서는:

1. `council.yongin.go.kr` 웹사이트의 HTML 구조를 분석
2. 각 스크레이퍼 파일의 `TODO` 주석 부분에 실제 CSS 셀렉터 및 파싱 로직 구현
3. 테스트 및 디버깅

## 다음 단계

### Phase 1 (현재)
- [ ] 웹사이트 구조 분석 및 스크레이퍼 로직 구현
- [ ] 데이터 수집 테스트
- [ ] GitHub Actions 자동화 스케줄 설정

### Phase 2 (AI 분석)
- [ ] Claude API를 사용한 회의록 발언 추출
- [ ] 표결 기록 추출 로직 구현
- [ ] Human-in-the-loop 검증 시스템

### Phase 3 (고급 기능)
- [ ] 벡터 임베딩 생성
- [ ] 정기적인 변경사항 모니터링
- [ ] 알림 시스템 연동
