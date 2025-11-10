/**
 * Supabase 데이터 Export 스크립트
 *
 * 사용법:
 * cd they_work_for_yongincitizen
 * node migration-scripts/1-export-supabase-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '../web/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Supabase 클라이언트 초기화
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Export 디렉토리 생성
const EXPORT_DIR = path.join(__dirname, '../exports');
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * 테이블 데이터 Export
 */
async function exportTable(tableName, orderBy = 'created_at') {
  console.log(`\n📥 Exporting ${tableName}...`);

  try {
    let query = supabase.from(tableName).select('*');

    // 정렬 (created_at이 없는 테이블 처리)
    if (orderBy) {
      query = query.order(orderBy);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log(`⚠️  ${tableName}: No data found (empty table)`);
      // 빈 배열이라도 저장
      fs.writeFileSync(
        path.join(EXPORT_DIR, `${tableName}.json`),
        JSON.stringify([], null, 2)
      );
      return 0;
    }

    // JSON 파일로 저장
    const jsonPath = path.join(EXPORT_DIR, `${tableName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    // CSV 파일로도 저장 (Excel 호환)
    const csvPath = path.join(EXPORT_DIR, `${tableName}.csv`);
    const csv = jsonToCSV(data);
    fs.writeFileSync(csvPath, csv);

    console.log(`✅ ${tableName}: ${data.length} rows exported`);
    console.log(`   - JSON: ${jsonPath}`);
    console.log(`   - CSV: ${csvPath}`);

    return data.length;
  } catch (error) {
    console.error(`❌ Error exporting ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * JSON을 CSV로 변환
 */
function jsonToCSV(data) {
  if (!data || data.length === 0) return '';

  // 헤더 추출
  const headers = Object.keys(data[0]);

  // CSV 행 생성
  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header];

      // null/undefined 처리
      if (value === null || value === undefined) return '';

      // 배열/객체는 JSON 문자열로
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }

      // 문자열에 쉼표/줄바꿈이 있으면 큰따옴표로 감싸기
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }

      return value;
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * 모든 테이블 Export
 */
async function exportAllTables() {
  console.log('🚀 Starting Supabase data export...');
  console.log(`📂 Export directory: ${EXPORT_DIR}`);

  const tables = [
    // Phase 1 핵심 테이블 (순서 중요: Foreign Key 의존성 고려)
    { name: 'councillors', orderBy: 'name' },
    { name: 'committees', orderBy: 'created_at' },
    { name: 'councillor_committees', orderBy: 'created_at' },
    { name: 'meetings', orderBy: 'meeting_date' },
    { name: 'bills', orderBy: 'proposal_date' },
    { name: 'bill_cosponsors', orderBy: 'created_at' },

    // Phase 2 테이블 (있을 경우)
    { name: 'speeches', orderBy: 'created_at' },
    { name: 'votes', orderBy: 'created_at' },

    // Phase 3 테이블 (있을 경우)
    { name: 'district_mapping', orderBy: 'created_at' },
    { name: 'user_profiles', orderBy: 'created_at' },
    { name: 'subscriptions', orderBy: 'created_at' },
    { name: 'notification_logs', orderBy: 'created_at' },
    { name: 'chat_history', orderBy: 'created_at' },
  ];

  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    empty: 0,
  };

  for (const table of tables) {
    try {
      const count = await exportTable(table.name, table.orderBy);
      stats.total++;
      if (count > 0) {
        stats.success++;
      } else {
        stats.empty++;
      }
    } catch (error) {
      stats.total++;
      stats.failed++;

      // 테이블이 존재하지 않는 경우 (Phase 2/3 미구현)
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log(`ℹ️  ${table.name}: Table does not exist (not implemented yet)`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Export Summary');
  console.log('='.repeat(60));
  console.log(`Total tables: ${stats.total}`);
  console.log(`✅ Exported: ${stats.success}`);
  console.log(`⚠️  Empty: ${stats.empty}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log('='.repeat(60));

  // 통계 파일 저장
  const statsPath = path.join(EXPORT_DIR, '_export_stats.json');
  fs.writeFileSync(statsPath, JSON.stringify({
    exportDate: new Date().toISOString(),
    stats,
    tables: tables.map(t => t.name),
  }, null, 2));

  console.log(`\n💾 Export complete! Files saved to: ${EXPORT_DIR}`);
  console.log(`📈 Statistics saved to: ${statsPath}`);

  // 다음 단계 안내
  console.log('\n📝 Next Steps:');
  console.log('1. Review exported data in ./exports/ directory');
  console.log('2. Run: node migration-scripts/2-import-to-pocketbase.js');
}

// 스크립트 실행
exportAllTables()
  .then(() => {
    console.log('\n✅ Export script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Export script failed:', error);
    process.exit(1);
  });
