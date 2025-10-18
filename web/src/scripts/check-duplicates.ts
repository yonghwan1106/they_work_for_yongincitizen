import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mopwsgknvcejfcmgeviv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDuplicates() {
  console.log('중복 데이터 확인 중...\n');

  const { data, error } = await supabase
    .from('councillors')
    .select('id, name, councillor_type, created_at')
    .in('councillor_type', ['국회의원', '경기도의원'])
    .order('councillor_type')
    .order('name')
    .order('created_at');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`총 ${data.length}개 레코드\n`);

  console.log('=== 국회의원 ===');
  const national = data.filter(d => d.councillor_type === '국회의원');
  national.forEach(d => {
    const date = new Date(d.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    console.log(`${d.name} - ${d.id.substring(0, 8)} - ${date}`);
  });

  console.log('\n=== 경기도의원 ===');
  const provincial = data.filter(d => d.councillor_type === '경기도의원');
  provincial.forEach(d => {
    const date = new Date(d.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    console.log(`${d.name} - ${d.id.substring(0, 8)} - ${date}`);
  });

  // 중복 확인
  const nameCount: Record<string, { count: number; ids: string[] }> = {};
  data.forEach(d => {
    const key = `${d.councillor_type}:${d.name}`;
    if (!nameCount[key]) {
      nameCount[key] = { count: 0, ids: [] };
    }
    nameCount[key].count++;
    nameCount[key].ids.push(d.id);
  });

  console.log('\n=== 중복 확인 ===');
  let hasDuplicates = false;
  Object.entries(nameCount).forEach(([key, info]) => {
    if (info.count > 1) {
      console.log(`${key}: ${info.count}개`);
      console.log(`  IDs: ${info.ids.map(id => id.substring(0, 8)).join(', ')}`);
      hasDuplicates = true;
    }
  });

  if (!hasDuplicates) {
    console.log('중복 없음');
  }

  return { data, duplicates: Object.entries(nameCount).filter(([_, info]) => info.count > 1) };
}

checkDuplicates();
