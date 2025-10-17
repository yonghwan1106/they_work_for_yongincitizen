import { createClient } from '@supabase/supabase-js';
import { scrapeAllNationalCouncillors } from './scrape-national-councillors';
import { scrapeProvincialCouncillors } from './scrape-provincial-councillors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수를 설정해주세요:');
  console.error('NEXT_PUBLIC_SUPABASE_URL');
  console.error('SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAllCouncillors() {
  console.log('=== 모든 선출직 공직자 데이터 수집 및 저장 시작 ===\n');

  try {
    // 1. 국회의원 데이터 수집 및 저장
    console.log('\n[1/2] 국회의원 데이터 수집 중...');
    const nationalCouncillors = await scrapeAllNationalCouncillors();

    console.log('\n국회의원 데이터 Supabase에 저장 중...');
    for (const councillor of nationalCouncillors) {
      const { data, error } = await supabase
        .from('councillors')
        .upsert({
          name: councillor.name,
          name_en: councillor.name_en,
          councillor_type: '국회의원',
          party: councillor.party,
          district: councillor.district,
          photo_url: councillor.photo_url,
          profile_url: councillor.profile_url,
          term_number: 22, // 제22대 국회
          is_active: true,
          email: councillor.email,
          phone: councillor.phone,
          office_location: councillor.office_location,
        }, {
          onConflict: 'name,councillor_type,district',
        });

      if (error) {
        console.error(`Error inserting ${councillor.name}:`, error);
      } else {
        console.log(`✓ ${councillor.name} 저장 완료`);
      }
    }

    // 2. 경기도의원 데이터 수집 및 저장
    console.log('\n[2/2] 경기도의원 데이터 수집 중...');
    const provincialCouncillors = await scrapeProvincialCouncillors();

    console.log('\n경기도의원 데이터 Supabase에 저장 중...');
    for (const councillor of provincialCouncillors) {
      const { data, error } = await supabase
        .from('councillors')
        .upsert({
          name: councillor.name,
          councillor_type: '경기도의원',
          party: councillor.party,
          district: councillor.district,
          photo_url: councillor.photo_url,
          profile_url: councillor.profile_url,
          term_number: 11, // 제11대 경기도의회
          is_active: true,
        }, {
          onConflict: 'name,councillor_type,district',
        });

      if (error) {
        console.error(`Error inserting ${councillor.name}:`, error);
      } else {
        console.log(`✓ ${councillor.name} 저장 완료`);
      }
    }

    console.log('\n=== 데이터 저장 완료 ===');
    console.log(`국회의원: ${nationalCouncillors.length}명`);
    console.log(`경기도의원: ${provincialCouncillors.length}명`);
    console.log(`총: ${nationalCouncillors.length + provincialCouncillors.length}명`);

    // 저장된 데이터 확인
    const { data: allData, error: countError } = await supabase
      .from('councillors')
      .select('councillor_type, count', { count: 'exact' })
      .in('councillor_type', ['국회의원', '경기도의원']);

    if (!countError && allData) {
      console.log('\n=== Supabase 저장 현황 ===');
      const { data: nationalCount } = await supabase
        .from('councillors')
        .select('*', { count: 'exact', head: true })
        .eq('councillor_type', '국회의원');

      const { data: provincialCount } = await supabase
        .from('councillors')
        .select('*', { count: 'exact', head: true })
        .eq('councillor_type', '경기도의원');

      const { data: cityCount } = await supabase
        .from('councillors')
        .select('*', { count: 'exact', head: true })
        .eq('councillor_type', '용인시의원');

      console.log(`국회의원: ${nationalCount?.length || 0}명`);
      console.log(`경기도의원: ${provincialCount?.length || 0}명`);
      console.log(`용인시의원: ${cityCount?.length || 0}명`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// 실행
seedAllCouncillors();
