-- Sample data for National Assembly Members and Provincial Assembly Members
-- Based on "용인 워치독" expansion plan (2024 기준)

-- =============================================
-- 국회의원 (National Assembly Members) - 4명
-- =============================================

INSERT INTO councillors (name, councillor_type, party, district, term_number, is_active) VALUES
('이상식', '국회의원', '더불어민주당', '용인시 갑', 22, true),
('손명수', '국회의원', '더불어민주당', '용인시 을', 22, true),
('부승찬', '국회의원', '더불어민주당', '용인시 병', 22, true),
('이언주', '국회의원', '더불어민주당', '용인시 정', 22, true);

-- =============================================
-- 경기도의원 (Provincial Assembly Members) - 10명
-- =============================================

INSERT INTO councillors (name, councillor_type, party, district, term_number, is_active) VALUES
('이영희', '경기도의원', '국민의힘', '용인시 제1선거구', 11, true),
('김영민', '경기도의원', '국민의힘', '용인시 제2선거구', 11, true),
('남종섭', '경기도의원', '더불어민주당', '용인시 제3선거구', 11, true),
('전자영', '경기도의원', '더불어민주당', '용인시 제4선거구', 11, true),
('정하용', '경기도의원', '국민의힘', '용인시 제5선거구', 11, true),
('지미연', '경기도의원', '국민의힘', '용인시 제6선거구', 11, true),
('김선희', '경기도의원', '국민의힘', '용인시 제7선거구', 11, true),
('강웅철', '경기도의원', '국민의힘', '용인시 제8선거구', 11, true),
('이성호', '경기도의원', '국민의힘', '용인시 제9선거구', 11, true),
('윤재영', '경기도의원', '국민의힘', '용인시 제10선거구', 11, true);

-- Note: 용인시의원 (City Council Members) 데이터는 기존 sample_data.sql에 있음
-- 총 46명: 국회의원 4명 + 경기도의원 10명 + 용인시의원 32명
