-- Add investigative projects tables (PRD v2.0)
-- Migration: Add investigations and investigation_councillors tables

-- =============================================
-- INVESTIGATIVE PROJECTS TABLES (PRD v2.0)
-- =============================================

-- 탐사 프로젝트 (Investigative Projects)
-- 예: "2024 해외출장 사용 내역 추적", "의정비 투명성 리포트", "개발 사업 추적"
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL, -- 프로젝트 제목
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly 제목 (예: 2024-overseas-trips)
    description TEXT, -- 프로젝트 설명
    category VARCHAR(50) NOT NULL, -- 세금낭비, 이해충돌, 개발사업
    status VARCHAR(50) DEFAULT 'ongoing', -- ongoing, completed
    published_date DATE,
    lead_data_source TEXT, -- 핵심 데이터 출처 (예: "용인시의회 예산서 2024")
    findings JSONB, -- 주요 발견 사항 (구조화된 데이터)
    -- findings 예시: {"total_trips": 15, "total_cost": 50000000, "avg_cost_per_trip": 3333333}
    visualizations TEXT[], -- 시각화 이미지 URL 배열
    summary TEXT, -- 프로젝트 요약 (1-2 문단)
    methodology TEXT, -- 조사 방법론 설명
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 탐사 프로젝트 - 의원 연결
-- 특정 탐사 프로젝트에 연루된 의원 목록
CREATE TABLE IF NOT EXISTS investigation_councillors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    councillor_id UUID REFERENCES councillors(id) ON DELETE CASCADE,
    involvement_description TEXT, -- 해당 의원의 연루 내용
    -- 예: "2024년 해외출장 3회, 총 비용 15,000,000원"
    data_points JSONB, -- 구조화된 데이터 포인트
    -- 예: {"trip_count": 3, "total_cost": 15000000, "destinations": ["미국", "일본"]}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(investigation_id, councillor_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_investigations_category ON investigations(category);
CREATE INDEX idx_investigations_status ON investigations(status);
CREATE INDEX idx_investigations_published_date ON investigations(published_date DESC);
CREATE INDEX idx_investigations_slug ON investigations(slug);

CREATE INDEX idx_investigation_councillors_investigation ON investigation_councillors(investigation_id);
CREATE INDEX idx_investigation_councillors_councillor ON investigation_councillors(councillor_id);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_investigations_updated_at BEFORE UPDATE ON investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_councillors ENABLE ROW LEVEL SECURITY;

-- Public can read all published investigations
CREATE POLICY "Public investigations read" ON investigations
    FOR SELECT USING (status = 'completed' OR status = 'ongoing');

CREATE POLICY "Public investigation_councillors read" ON investigation_councillors
    FOR SELECT USING (true);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Example investigative project
INSERT INTO investigations (
    title,
    slug,
    description,
    category,
    status,
    published_date,
    lead_data_source,
    findings,
    summary,
    methodology
) VALUES (
    '2024년 해외출장 사용 내역 추적',
    '2024-overseas-trips',
    '용인시의회 의원들의 2024년 해외출장 현황을 분석하고 비용 효율성을 검토합니다.',
    '세금낭비',
    'ongoing',
    '2025-10-18',
    '용인시의회 예산서 2024, 회의록 출장 보고서',
    '{"total_trips": 15, "total_cost": 50000000, "avg_cost_per_trip": 3333333, "destinations": {"미국": 5, "일본": 4, "유럽": 6}}',
    '2024년 용인시의회 의원들은 총 15회의 해외출장을 다녀왔으며, 총 비용은 5천만원입니다. 출장 목적과 성과를 출장 보고서를 통해 검증하고, 타 지자체 의회와 비교 분석합니다.',
    '1. 용인시의회 예산서에서 해외출장비 항목 추출
2. 회의록에서 출장 보고서 수집
3. 출장 목적지, 비용, 참가 의원 데이터베이스화
4. 출장 성과 분석 (보고서 내용 검토)
5. 타 지자체 의회 비교 (경기도 내 8개 시)'
);

COMMENT ON TABLE investigations IS 'PRD v2.0: 데이터 저널리즘 탐사 프로젝트 메타데이터';
COMMENT ON TABLE investigation_councillors IS 'PRD v2.0: 탐사 프로젝트와 연루된 의원 연결 테이블';
COMMENT ON COLUMN investigations.findings IS 'JSONB 구조화 데이터: 프로젝트의 주요 통계 및 발견사항';
COMMENT ON COLUMN investigation_councillors.data_points IS 'JSONB: 해당 의원의 구체적 수치 데이터';
