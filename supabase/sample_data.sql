-- 샘플 데이터 삽입 스크립트
-- 개발 및 테스트용 데모 데이터

-- 1. 샘플 의원 데이터
INSERT INTO councillors (name, party, district, term_number, is_active, email, phone) VALUES
('김민수', '더불어민주당', '기흥구 가선거구', 8, true, 'minsu.kim@yongin.go.kr', '031-324-0001'),
('이영희', '국민의힘', '수지구 나선거구', 8, true, 'younghee.lee@yongin.go.kr', '031-324-0002'),
('박철호', '더불어민주당', '처인구 다선거구', 8, true, 'chulho.park@yongin.go.kr', '031-324-0003'),
('정수연', '국민의힘', '기흥구 라선거구', 8, true, 'sooyeon.jung@yongin.go.kr', '031-324-0004'),
('강동현', '정의당', '수지구 마선거구', 8, true, 'donghyun.kang@yongin.go.kr', '031-324-0005'),
('최민지', '더불어민주당', '처인구 바선거구', 8, true, 'minji.choi@yongin.go.kr', '031-324-0006');

-- 2. 샘플 위원회 데이터
INSERT INTO committees (name, type, description) VALUES
('의회운영위원회', '상임위원회', '의회 운영에 관한 사항을 심의하는 위원회'),
('기획행정위원회', '상임위원회', '기획, 예산, 행정 전반에 관한 사항을 심의'),
('산업건설위원회', '상임위원회', '산업, 건설, 교통 등에 관한 사항을 심의'),
('교육문화위원회', '상임위원회', '교육, 문화, 체육, 관광에 관한 사항을 심의'),
('환경복지위원회', '상임위원회', '환경, 보건, 복지에 관한 사항을 심의');

-- 3. 샘플 회의 데이터
INSERT INTO meetings (title, meeting_type, meeting_date, session_number, meeting_number, transcript_url) VALUES
('제8대 용인특례시의회 제1회 정례회 제1차 본회의', '본회의', '2024-09-02', 1, 1, 'https://council.yongin.go.kr/kr/minutes.do?id=1'),
('제8대 용인특례시의회 제1회 정례회 제2차 본회의', '본회의', '2024-09-15', 1, 2, 'https://council.yongin.go.kr/kr/minutes.do?id=2'),
('기획행정위원회 제1차 회의', '상임위원회', '2024-09-05', 1, 1, 'https://council.yongin.go.kr/kr/minutes.do?id=3'),
('환경복지위원회 제1차 회의', '상임위원회', '2024-09-07', 1, 1, 'https://council.yongin.go.kr/kr/minutes.do?id=4'),
('산업건설위원회 제1차 회의', '상임위원회', '2024-09-10', 1, 1, 'https://council.yongin.go.kr/kr/minutes.do?id=5');

-- 4. 샘플 의안 데이터
INSERT INTO bills (bill_number, title, bill_type, proposal_date, status, result, summary) VALUES
('제1호', '용인특례시 주민참여예산제 운영 조례 일부개정조례안', '조례안', '2024-09-02', '가결', '원안가결', '주민참여예산제의 참여 범위를 확대하고 절차를 개선하기 위한 조례 개정'),
('제2호', '용인특례시 환경보호 기금 설치 및 운용 조례안', '조례안', '2024-09-02', '가결', '수정가결', '환경보호를 위한 기금을 설치하고 그 운용에 관한 사항을 규정'),
('제3호', '용인특례시 청년 지원 조례안', '조례안', '2024-09-03', '심사중', null, '청년의 권익 증진과 청년 정책 추진을 위한 조례 제정'),
('제4호', '용인특례시 공공자전거 운영 및 관리 조례안', '조례안', '2024-09-05', '가결', '원안가결', '공공자전거 대여 시스템 운영에 필요한 사항을 규정'),
('제5호', '2024년도 제1회 추가경정예산안', '예산안', '2024-09-08', '가결', '수정가결', '2024년도 추가경정예산안 심의');

-- 5. 의안과 발의자 연결 (proposer_id 업데이트)
-- 첫 번째 의원이 1, 2번 의안 발의
UPDATE bills SET proposer_id = (SELECT id FROM councillors WHERE name = '김민수' LIMIT 1) WHERE bill_number IN ('제1호', '제2호');

-- 두 번째 의원이 3번 의안 발의
UPDATE bills SET proposer_id = (SELECT id FROM councillors WHERE name = '이영희' LIMIT 1) WHERE bill_number = '제3호';

-- 세 번째 의원이 4번 의안 발의
UPDATE bills SET proposer_id = (SELECT id FROM councillors WHERE name = '박철호' LIMIT 1) WHERE bill_number = '제4호';

-- 네 번째 의원이 5번 의안 발의
UPDATE bills SET proposer_id = (SELECT id FROM councillors WHERE name = '정수연' LIMIT 1) WHERE bill_number = '제5호';

-- 6. 샘플 발언 데이터
INSERT INTO speeches (meeting_id, councillor_id, speech_order, speech_text, summary, keywords)
SELECT
    m.id,
    c.id,
    1,
    '존경하는 의장님 그리고 선배·동료 의원 여러분! 안녕하십니까? 기흥구 가선거구 김민수 의원입니다. 오늘 제가 대표 발의한 주민참여예산제 운영 조례 일부개정조례안에 대해 제안설명을 드리겠습니다. 현행 조례는 주민참여예산의 범위와 절차가 제한적이어서 실질적인 주민참여가 어려운 실정입니다. 이에 참여 대상을 확대하고 온라인 투표를 도입하여 더 많은 시민이 참여할 수 있도록 개정하고자 합니다.',
    '주민참여예산제 조례 개정안 제안. 참여 범위 확대 및 온라인 투표 도입을 통한 시민참여 활성화 필요성 강조.',
    ARRAY['주민참여예산', '조례개정', '시민참여', '온라인투표']
FROM meetings m, councillors c
WHERE m.title LIKE '%제1차 본회의%' AND c.name = '김민수'
LIMIT 1;

INSERT INTO speeches (meeting_id, councillor_id, speech_order, speech_text, summary, keywords)
SELECT
    m.id,
    c.id,
    2,
    '의장님, 질의하겠습니다. 수지구 나선거구 이영희 의원입니다. 김민수 의원님께서 발의하신 조례안에 대해 몇 가지 질의드립니다. 온라인 투표 시스템 도입 시 예상 비용은 얼마나 되며, 보안 대책은 어떻게 마련되어 있습니까?',
    '주민참여예산제 조례안에 대한 질의. 온라인 투표 시스템 비용 및 보안 대책 확인.',
    ARRAY['질의', '온라인투표', '예산', '보안']
FROM meetings m, councillors c
WHERE m.title LIKE '%제1차 본회의%' AND c.name = '이영희'
LIMIT 1;

INSERT INTO speeches (meeting_id, councillor_id, speech_order, speech_text, summary, keywords)
SELECT
    m.id,
    c.id,
    1,
    '환경복지위원회 위원장 최민지입니다. 오늘 우리 위원회에서는 환경보호 기금 설치 조례안을 심사하였습니다. 기후위기 시대에 환경보호는 선택이 아닌 필수입니다. 본 기금을 통해 용인시의 녹지 보호, 탄소중립 정책, 재생에너지 확대 등 다양한 환경 정책을 추진할 수 있을 것으로 기대됩니다.',
    '환경보호 기금 조례안 심사 결과 보고. 기후위기 대응 및 환경 정책 추진의 필요성 강조.',
    ARRAY['환경보호', '기후위기', '탄소중립', '재생에너지']
FROM meetings m, councillors c
WHERE m.title LIKE '%환경복지위원회%' AND c.name = '최민지'
LIMIT 1;

-- 7. 샘플 표결 기록 (검증된 데이터)
INSERT INTO votes (bill_id, councillor_id, vote_cast, is_verified, verified_by, verified_at)
SELECT
    b.id,
    c.id,
    '찬성',
    true,
    'admin',
    NOW()
FROM bills b, councillors c
WHERE b.bill_number = '제1호' AND c.name IN ('김민수', '박철호', '최민지', '강동현');

INSERT INTO votes (bill_id, councillor_id, vote_cast, is_verified, verified_by, verified_at)
SELECT
    b.id,
    c.id,
    '반대',
    true,
    'admin',
    NOW()
FROM bills b, councillors c
WHERE b.bill_number = '제1호' AND c.name IN ('이영희', '정수연');

INSERT INTO votes (bill_id, councillor_id, vote_cast, is_verified, verified_by, verified_at)
SELECT
    b.id,
    c.id,
    '찬성',
    true,
    'admin',
    NOW()
FROM bills b, councillors c
WHERE b.bill_number = '제2호';

-- 완료 메시지
SELECT '샘플 데이터 삽입 완료!' as message;
SELECT COUNT(*) as councillor_count FROM councillors;
SELECT COUNT(*) as committee_count FROM committees;
SELECT COUNT(*) as meeting_count FROM meetings;
SELECT COUNT(*) as bill_count FROM bills;
SELECT COUNT(*) as speech_count FROM speeches;
SELECT COUNT(*) as vote_count FROM votes WHERE is_verified = true;
