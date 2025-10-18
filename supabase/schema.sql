-- 용인시의회 모니터링 플랫폼 데이터베이스 스키마
-- Created for "그들은 용인시민을 위해 일합니다" project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings (Phase 3)

-- =============================================
-- CORE TABLES (Phase 1)
-- =============================================

-- 의원 정보 (Councillors)
CREATE TABLE councillors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    councillor_type VARCHAR(20) NOT NULL DEFAULT '용인시의원' CHECK (councillor_type IN ('국회의원', '경기도의원', '용인시의원')), -- 의원 유형: 국회의원, 경기도의원, 용인시의원
    party VARCHAR(50), -- 정당
    district VARCHAR(100), -- 선거구
    photo_url TEXT,
    term_number INTEGER, -- 몇 대 의원 (예: 8대)
    is_active BOOLEAN DEFAULT true,
    email VARCHAR(100),
    phone VARCHAR(50),
    office_location VARCHAR(200),
    profile_url TEXT, -- 공식 웹사이트 프로필 링크
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 위원회 정보 (Committees)
CREATE TABLE committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    type VARCHAR(50), -- 상임위원회, 특별위원회 등
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 의원-위원회 관계 (Councillor Committee Memberships)
CREATE TABLE councillor_committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    councillor_id UUID REFERENCES councillors(id) ON DELETE CASCADE,
    committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
    role VARCHAR(50), -- 위원장, 부위원장, 위원
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(councillor_id, committee_id, start_date)
);

-- 회의 정보 (Meetings)
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    meeting_type VARCHAR(100), -- 본회의, 상임위원회, 특별위원회 등
    committee_id UUID REFERENCES committees(id),
    meeting_date DATE NOT NULL,
    session_number INTEGER, -- 회기
    meeting_number INTEGER, -- 차수
    transcript_url TEXT, -- 회의록 원문 URL
    video_url TEXT, -- 영상회의록 URL
    transcript_text TEXT, -- 전체 회의록 텍스트
    is_processed BOOLEAN DEFAULT false, -- AI 처리 완료 여부
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 의안 정보 (Bills)
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(50) UNIQUE,
    title VARCHAR(500) NOT NULL,
    bill_type VARCHAR(100), -- 조례안, 예산안 등
    proposer_id UUID REFERENCES councillors(id), -- 대표 발의자
    proposal_date DATE,
    status VARCHAR(50), -- 발의, 상정, 가결, 부결 등
    result VARCHAR(50), -- 원안가결, 수정가결, 부결 등
    summary TEXT,
    full_text TEXT,
    bill_url TEXT, -- 공식 사이트 의안 상세 페이지
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 의안 공동발의자 (Bill Cosponsors)
CREATE TABLE bill_cosponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    councillor_id UUID REFERENCES councillors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bill_id, councillor_id)
);

-- =============================================
-- PHASE 2 TABLES (Accountability Engine)
-- =============================================

-- 발언 기록 (Speeches)
CREATE TABLE speeches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    councillor_id UUID REFERENCES councillors(id),
    speech_order INTEGER, -- 발언 순서
    speech_text TEXT NOT NULL,
    summary TEXT, -- AI 생성 요약
    keywords TEXT[], -- AI 추출 키워드
    timestamp_start INTEGER, -- 영상 시작 시간 (초)
    timestamp_end INTEGER, -- 영상 종료 시간 (초)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 표결 기록 (Votes)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    councillor_id UUID REFERENCES councillors(id) ON DELETE CASCADE,
    vote_cast VARCHAR(20) NOT NULL, -- '찬성', '반대', '기권'
    is_verified BOOLEAN DEFAULT false, -- 검증 완료 여부
    verified_by VARCHAR(100), -- 검증자 (admin username)
    verified_at TIMESTAMPTZ,
    source_meeting_id UUID REFERENCES meetings(id), -- 출처 회의
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bill_id, councillor_id)
);

-- =============================================
-- PHASE 3 TABLES (Engagement & Advanced)
-- =============================================

-- 선거구 매핑 (Electoral District Mapping)
CREATE TABLE district_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_name VARCHAR(100) NOT NULL, -- 선거구명
    administrative_dong VARCHAR(100), -- 행정동
    legal_dong VARCHAR(100), -- 법정동
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 (Users) - Supabase Auth와 연동
-- auth.users 테이블을 사용하므로 별도 생성 불필요, 프로필만 확장

-- 사용자 프로필 확장 (User Profiles)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 구독 (Subscriptions)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'councillor', 'keyword', 'bill'
    councillor_id UUID REFERENCES councillors(id),
    keyword TEXT,
    bill_id UUID REFERENCES bills(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 발송 기록 (Notification Log)
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    trigger_type VARCHAR(100), -- 'new_speech', 'new_bill', 'keyword_match'
    trigger_id UUID, -- meeting_id, bill_id 등
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    email_status VARCHAR(50) -- 'sent', 'failed'
);

-- AI 채팅 기록 (Chat History) - Phase 3
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources JSONB, -- 답변의 근거가 된 데이터 (회의록, 의안 등) ID 목록
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 임베딩 벡터 저장 (Phase 3 - RAG)
CREATE TABLE speech_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    speech_id UUID REFERENCES speeches(id) ON DELETE CASCADE,
    embedding vector(1536), -- Claude 또는 다른 모델의 임베딩 차원
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Councillors
CREATE INDEX idx_councillors_name ON councillors(name);
CREATE INDEX idx_councillors_party ON councillors(party);
CREATE INDEX idx_councillors_district ON councillors(district);
CREATE INDEX idx_councillors_type ON councillors(councillor_type);
CREATE INDEX idx_councillors_active ON councillors(is_active);

-- Meetings
CREATE INDEX idx_meetings_date ON meetings(meeting_date DESC);
CREATE INDEX idx_meetings_type ON meetings(meeting_type);
CREATE INDEX idx_meetings_committee ON meetings(committee_id);
CREATE INDEX idx_meetings_title_search ON meetings USING gin(title gin_trgm_ops);
CREATE INDEX idx_meetings_transcript_search ON meetings USING gin(transcript_text gin_trgm_ops);

-- Bills
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_proposer ON bills(proposer_id);
CREATE INDEX idx_bills_date ON bills(proposal_date DESC);
CREATE INDEX idx_bills_title_search ON bills USING gin(title gin_trgm_ops);
CREATE INDEX idx_bills_summary_search ON bills USING gin(summary gin_trgm_ops);

-- Speeches
CREATE INDEX idx_speeches_meeting ON speeches(meeting_id);
CREATE INDEX idx_speeches_councillor ON speeches(councillor_id);
-- Use pg_trgm for better Korean text search (trigram-based fuzzy matching)
CREATE INDEX idx_speeches_text_search ON speeches USING gin(speech_text gin_trgm_ops);
CREATE INDEX idx_speeches_summary_search ON speeches USING gin(summary gin_trgm_ops);

-- Votes
CREATE INDEX idx_votes_bill ON votes(bill_id);
CREATE INDEX idx_votes_councillor ON votes(councillor_id);
CREATE INDEX idx_votes_verified ON votes(is_verified);

-- Subscriptions
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_type ON subscriptions(alert_type);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);

-- Vector similarity search (Phase 3)
CREATE INDEX idx_speech_embeddings_vector ON speech_embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- 자동 updated_at 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 한국어 텍스트 검색 함수 (pg_trgm 사용)
-- 사용 예: SELECT * FROM search_speeches('환경') LIMIT 10;
CREATE OR REPLACE FUNCTION search_speeches(search_query TEXT)
RETURNS TABLE (
    id UUID,
    meeting_id UUID,
    councillor_id UUID,
    speech_text TEXT,
    summary TEXT,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.meeting_id,
        s.councillor_id,
        s.speech_text,
        s.summary,
        GREATEST(
            similarity(s.speech_text, search_query),
            similarity(COALESCE(s.summary, ''), search_query)
        ) AS similarity
    FROM speeches s
    WHERE
        s.speech_text % search_query
        OR COALESCE(s.summary, '') % search_query
    ORDER BY similarity DESC;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 적용
CREATE TRIGGER update_councillors_updated_at BEFORE UPDATE ON councillors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speeches_updated_at BEFORE UPDATE ON speeches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Public read access for core data
ALTER TABLE councillors ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public can read all councillor, meeting, bill, speech, vote data
CREATE POLICY "Public councillors read" ON councillors FOR SELECT USING (true);
CREATE POLICY "Public committees read" ON committees FOR SELECT USING (true);
CREATE POLICY "Public meetings read" ON meetings FOR SELECT USING (true);
CREATE POLICY "Public bills read" ON bills FOR SELECT USING (true);
CREATE POLICY "Public speeches read" ON speeches FOR SELECT USING (true);
CREATE POLICY "Public votes read" ON votes FOR SELECT USING (is_verified = true);

-- User-specific data access
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can manage their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own chat history
CREATE POLICY "Users can view own chat history" ON chat_history
    FOR SELECT USING (auth.uid() = user_id);
