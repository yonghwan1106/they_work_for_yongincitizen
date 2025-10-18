import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mopwsgknvcejfcmgeviv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeDuplicates() {
  console.log('중복 데이터 제거 중...\n');

  // 국회의원과 경기도의원 데이터 가져오기
  const { data, error } = await supabase
    .from('councillors')
    .select('id, name, councillor_type, created_at')
    .in('councillor_type', ['국회의원', '경기도의원'])
    .order('created_at');

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log(`총 ${data.length}개 레코드 발견\n`);

  // 각 의원별로 그룹화
  const grouped: Record<string, typeof data> = {};
  data.forEach(d => {
    const key = `${d.councillor_type}:${d.name}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(d);
  });

  // 중복된 경우 오래된 것들 삭제 (가장 최신 것만 남김)
  const idsToDelete: string[] = [];

  Object.entries(grouped).forEach(([key, records]) => {
    if (records.length > 1) {
      console.log(`${key}: ${records.length}개 중복`);
      // 최신 것 제외하고 모두 삭제 대상으로 추가
      const sortedRecords = records.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const toDelete = sortedRecords.slice(1); // 가장 최신 것 제외
      toDelete.forEach(record => {
        console.log(`  삭제 예정: ${record.id.substring(0, 8)} (${new Date(record.created_at).toLocaleString('ko-KR')})`);
        idsToDelete.push(record.id);
      });
      console.log(`  유지: ${sortedRecords[0].id.substring(0, 8)} (${new Date(sortedRecords[0].created_at).toLocaleString('ko-KR')})\n`);
    }
  });

  if (idsToDelete.length === 0) {
    console.log('삭제할 중복 데이터가 없습니다.');
    return;
  }

  console.log(`\n총 ${idsToDelete.length}개 레코드 삭제 예정`);
  console.log('삭제 진행 중...\n');

  // 삭제 실행
  const { error: deleteError } = await supabase
    .from('councillors')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error('❌ 삭제 중 오류:', deleteError);
    return;
  }

  console.log('✅ 중복 데이터 삭제 완료!');
  console.log(`삭제된 레코드: ${idsToDelete.length}개\n`);

  // 최종 확인
  const { data: finalData, error: finalError } = await supabase
    .from('councillors')
    .select('councillor_type')
    .in('councillor_type', ['국회의원', '경기도의원']);

  if (!finalError && finalData) {
    const national = finalData.filter(d => d.councillor_type === '국회의원').length;
    const provincial = finalData.filter(d => d.councillor_type === '경기도의원').length;
    console.log('=== 최종 현황 ===');
    console.log(`국회의원: ${national}명`);
    console.log(`경기도의원: ${provincial}명`);
    console.log(`총: ${national + provincial}명`);
  }
}

removeDuplicates();
