/**
 * PocketBase 데이터 Import 스크립트
 *
 * 사용법:
 * cd they_work_for_yongincitizen
 * node migration-scripts/2-import-to-pocketbase.js
 *
 * 사전 요구사항:
 * 1. PocketBase 컬렉션이 생성되어 있어야 함
 * 2. POCKETBASE_MIGRATION_GUIDE.md의 3.2절 참조
 */

const PocketBase = require('pocketbase').default || require('pocketbase');
const fs = require('fs');
const path = require('path');

// 환경 변수
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://theyworkforcitizen-api.duckdns.org';
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
  console.error('❌ Error: PocketBase admin credentials not found');
  console.error('Required environment variables:');
  console.error('  - POCKETBASE_ADMIN_EMAIL');
  console.error('  - POCKETBASE_ADMIN_PASSWORD');
  console.error('\nSet them in your shell:');
  console.error('  export POCKETBASE_ADMIN_EMAIL="admin@example.com"');
  console.error('  export POCKETBASE_ADMIN_PASSWORD="your-password"');
  process.exit(1);
}

// PocketBase 클라이언트 초기화
const pb = new PocketBase(POCKETBASE_URL);

// Export 디렉토리
const EXPORT_DIR = path.join(__dirname, '../exports');

// ID 매핑 저장 (Supabase UUID → PocketBase ID)
const idMap = {
  councillors: {},
  committees: {},
  meetings: {},
  bills: {},
};

/**
 * PocketBase Admin 인증
 */
async function authenticateAdmin() {
  console.log('🔐 Authenticating as PocketBase admin...');

  try {
    await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
    console.log('✅ Admin authentication successful');
    console.log(`   Logged in as: ${POCKETBASE_ADMIN_EMAIL}`);
  } catch (error) {
    console.error('❌ Admin authentication failed:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. Wrong email or password');
    console.error('  2. PocketBase server is not running');
    console.error('  3. Network connectivity issues');
    throw error;
  }
}

/**
 * 컬렉션 존재 여부 확인
 */
async function checkCollections() {
  console.log('\n📋 Checking PocketBase collections...');

  const requiredCollections = [
    'councillors',
    'committees',
    'councillor_committees',
    'meetings',
    'bills',
    'bill_cosponsors',
  ];

  try {
    const collections = await pb.collections.getFullList();
    const collectionNames = collections.map(c => c.name);

    const missing = requiredCollections.filter(name => !collectionNames.includes(name));

    if (missing.length > 0) {
      console.error('❌ Missing collections:', missing.join(', '));
      console.error('\nPlease create these collections first:');
      console.error('See POCKETBASE_MIGRATION_GUIDE.md section 3.2');
      throw new Error('Missing required collections');
    }

    console.log('✅ All required collections exist');
    return true;
  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
    throw error;
  }
}

/**
 * JSON 파일 로드
 */
function loadExportData(tableName) {
  const filePath = path.join(EXPORT_DIR, `${tableName}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📂 Loaded ${data.length} records from ${tableName}.json`);
  return data;
}

/**
 * Councillors Import
 */
async function importCouncillors() {
  console.log('\n👥 Importing councillors...');

  const councillors = loadExportData('councillors');
  if (councillors.length === 0) {
    console.log('⚠️  No councillors to import');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const councillor of councillors) {
    try {
      const pbData = {
        name: councillor.name,
        name_en: councillor.name_en || '',
        councillor_type: councillor.councillor_type || '용인시의원',
        party: councillor.party || '',
        district: councillor.district || '',
        // photo는 나중에 별도 처리 (3-migrate-images.js)
        term_number: councillor.term_number || 0,
        is_active: councillor.is_active !== false, // default true
        email: councillor.email || '',
        phone: councillor.phone || '',
        office_location: councillor.office_location || '',
        profile_url: councillor.profile_url || '',
      };

      const record = await pb.collection('councillors').create(pbData);
      idMap.councillors[councillor.id] = record.id;
      successCount++;

      console.log(`  ✅ ${councillor.name} (${record.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${councillor.name}: ${error.message}`);
    }
  }

  console.log(`\n📊 Councillors: ${successCount} success, ${errorCount} errors`);
}

/**
 * Committees Import
 */
async function importCommittees() {
  console.log('\n🏛️  Importing committees...');

  const committees = loadExportData('committees');
  if (committees.length === 0) {
    console.log('⚠️  No committees to import');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const committee of committees) {
    try {
      const pbData = {
        name: committee.name,
        name_en: committee.name_en || '',
        type: committee.type || '',
        description: committee.description || '',
      };

      const record = await pb.collection('committees').create(pbData);
      idMap.committees[committee.id] = record.id;
      successCount++;

      console.log(`  ✅ ${committee.name} (${record.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${committee.name}: ${error.message}`);
    }
  }

  console.log(`\n📊 Committees: ${successCount} success, ${errorCount} errors`);
}

/**
 * Councillor-Committees Import (Relation)
 */
async function importCouncillorCommittees() {
  console.log('\n🔗 Importing councillor-committee relationships...');

  const relationships = loadExportData('councillor_committees');
  if (relationships.length === 0) {
    console.log('⚠️  No relationships to import');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const rel of relationships) {
    try {
      const pbData = {
        councillor: idMap.councillors[rel.councillor_id],
        committee: idMap.committees[rel.committee_id],
        role: rel.role || '',
        start_date: rel.start_date || '',
        end_date: rel.end_date || '',
      };

      // ID 매핑이 없으면 스킵
      if (!pbData.councillor || !pbData.committee) {
        console.warn(`  ⚠️  Skipping: missing ID mapping`);
        errorCount++;
        continue;
      }

      const record = await pb.collection('councillor_committees').create(pbData);
      successCount++;

      console.log(`  ✅ ${pbData.role} relationship created (${record.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Relationships: ${successCount} success, ${errorCount} errors`);
}

/**
 * Meetings Import
 */
async function importMeetings() {
  console.log('\n📅 Importing meetings...');

  const meetings = loadExportData('meetings');
  if (meetings.length === 0) {
    console.log('⚠️  No meetings to import');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const meeting of meetings) {
    try {
      const pbData = {
        title: meeting.title,
        meeting_type: meeting.meeting_type || '',
        committee: meeting.committee_id ? idMap.committees[meeting.committee_id] : '',
        meeting_date: meeting.meeting_date || '',
        session_number: meeting.session_number || 0,
        meeting_number: meeting.meeting_number || 0,
        transcript_url: meeting.transcript_url || '',
        video_url: meeting.video_url || '',
        transcript_text: meeting.transcript_text || '',
        is_processed: meeting.is_processed || false,
      };

      const record = await pb.collection('meetings').create(pbData);
      idMap.meetings[meeting.id] = record.id;
      successCount++;

      console.log(`  ✅ ${meeting.title} (${record.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${meeting.title}: ${error.message}`);
    }
  }

  console.log(`\n📊 Meetings: ${successCount} success, ${errorCount} errors`);
}

/**
 * Bills Import
 */
async function importBills() {
  console.log('\n📜 Importing bills...');

  const bills = loadExportData('bills');
  if (bills.length === 0) {
    console.log('⚠️  No bills to import');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const bill of bills) {
    try {
      const pbData = {
        bill_number: bill.bill_number || '',
        title: bill.title,
        bill_type: bill.bill_type || '',
        proposer: bill.proposer_id ? idMap.councillors[bill.proposer_id] : '',
        proposal_date: bill.proposal_date || '',
        status: bill.status || '',
        result: bill.result || '',
        summary: bill.summary || '',
        full_text: bill.full_text || '',
        bill_url: bill.bill_url || '',
      };

      const record = await pb.collection('bills').create(pbData);
      idMap.bills[bill.id] = record.id;
      successCount++;

      console.log(`  ✅ ${bill.bill_number}: ${bill.title} (${record.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${bill.bill_number}: ${error.message}`);
    }
  }

  console.log(`\n📊 Bills: ${successCount} success, ${errorCount} errors`);
}

/**
 * Bill Cosponsors Import
 */
async function importBillCosponsors() {
  console.log('\n🤝 Importing bill cosponsors...');

  const cosponsors = loadExportData('bill_cosponsors');
  if (cosponsors.length === 0) {
    console.log('⚠️  No cosponsors to import');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const cosponsor of cosponsors) {
    try {
      const pbData = {
        bill: idMap.bills[cosponsor.bill_id],
        councillor: idMap.councillors[cosponsor.councillor_id],
      };

      // ID 매핑이 없으면 스킵
      if (!pbData.bill || !pbData.councillor) {
        console.warn(`  ⚠️  Skipping: missing ID mapping`);
        errorCount++;
        continue;
      }

      const record = await pb.collection('bill_cosponsors').create(pbData);
      successCount++;

      console.log(`  ✅ Cosponsor relationship created (${record.id})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Bill Cosponsors: ${successCount} success, ${errorCount} errors`);
}

/**
 * ID 매핑 저장
 */
function saveIdMapping() {
  const mappingPath = path.join(EXPORT_DIR, 'id_mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(idMap, null, 2));

  console.log(`\n💾 ID mapping saved to: ${mappingPath}`);
  console.log('   This file maps Supabase UUIDs to PocketBase IDs');
  console.log('   Keep it for reference and image migration');
}

/**
 * 메인 Import 함수
 */
async function importAllData() {
  console.log('🚀 Starting PocketBase data import...');
  console.log(`🌐 PocketBase URL: ${POCKETBASE_URL}`);

  try {
    // 1. Admin 인증
    await authenticateAdmin();

    // 2. 컬렉션 확인
    await checkCollections();

    // 3. 순서대로 Import (Foreign Key 의존성 고려)
    await importCouncillors();
    await importCommittees();
    await importCouncillorCommittees();
    await importMeetings();
    await importBills();
    await importBillCosponsors();

    // 4. ID 매핑 저장
    saveIdMapping();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Import Complete!');
    console.log('='.repeat(60));

    console.log('\n📝 Next Steps:');
    console.log('1. Verify data in PocketBase Admin UI:');
    console.log(`   ${POCKETBASE_URL}/_/`);
    console.log('2. Run image migration:');
    console.log('   node migration-scripts/3-migrate-images.js');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    throw error;
  }
}

// 스크립트 실행
importAllData()
  .then(() => {
    console.log('\n✅ Import script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Import script failed:', error);
    process.exit(1);
  });
