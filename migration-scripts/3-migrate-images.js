/**
 * PocketBase 이미지 마이그레이션 스크립트
 *
 * Supabase Storage의 의원 사진을 PocketBase로 마이그레이션
 *
 * 사용법:
 * cd they_work_for_yongincitizen
 * node migration-scripts/3-migrate-images.js
 *
 * 사전 요구사항:
 * 1. 2-import-to-pocketbase.js 실행 완료
 * 2. id_mapping.json 파일 존재
 */

const PocketBase = require('pocketbase').default || require('pocketbase');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// 환경 변수
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://theyworkforcitizen-api.duckdns.org';
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
  console.error('❌ Error: PocketBase admin credentials not found');
  console.error('Required environment variables:');
  console.error('  - POCKETBASE_ADMIN_EMAIL');
  console.error('  - POCKETBASE_ADMIN_PASSWORD');
  process.exit(1);
}

// PocketBase 클라이언트
const pb = new PocketBase(POCKETBASE_URL);

// Export 디렉토리
const EXPORT_DIR = path.join(__dirname, '../exports');

/**
 * Admin 인증
 */
async function authenticateAdmin() {
  console.log('🔐 Authenticating as PocketBase admin...');

  try {
    await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
    console.log('✅ Admin authentication successful');
  } catch (error) {
    console.error('❌ Admin authentication failed:', error.message);
    throw error;
  }
}

/**
 * ID 매핑 로드
 */
function loadIdMapping() {
  const mappingPath = path.join(EXPORT_DIR, 'id_mapping.json');

  if (!fs.existsSync(mappingPath)) {
    console.error('❌ Error: id_mapping.json not found');
    console.error('Please run 2-import-to-pocketbase.js first');
    process.exit(1);
  }

  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  console.log('📂 ID mapping loaded');
  return mapping;
}

/**
 * Councillor 데이터 로드
 */
function loadCouncillors() {
  const filePath = path.join(EXPORT_DIR, 'councillors.json');

  if (!fs.existsSync(filePath)) {
    console.error('❌ Error: councillors.json not found');
    console.error('Please run 1-export-supabase-data.js first');
    process.exit(1);
  }

  const councillors = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📂 Loaded ${councillors.length} councillors`);
  return councillors;
}

/**
 * 이미지 다운로드 (Supabase Storage)
 */
async function downloadImage(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10초 타임아웃
    });

    return {
      buffer: Buffer.from(response.data),
      contentType: response.headers['content-type'] || 'image/jpeg',
    };
  } catch (error) {
    console.error(`  ❌ Download failed: ${error.message}`);
    return null;
  }
}

/**
 * PocketBase에 이미지 업로드
 */
async function uploadImageToPocketBase(pbId, imageBuffer, filename, contentType) {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('photo', imageBuffer, {
      filename,
      contentType,
    });

    // PocketBase SDK의 update 메서드 사용
    const record = await pb.collection('councillors').update(pbId, formData);

    return record.photo; // 업로드된 파일명 반환
  } catch (error) {
    console.error(`  ❌ Upload failed: ${error.message}`);
    return null;
  }
}

/**
 * 파일명 추출 (URL에서)
 */
function getFilenameFromUrl(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    return filename || 'photo.jpg';
  } catch (error) {
    return 'photo.jpg';
  }
}

/**
 * 이미지 마이그레이션 (단일 의원)
 */
async function migrateCouncillorImage(councillor, idMap) {
  const { id: supabaseId, name, photo_url } = councillor;

  // PocketBase ID 찾기
  const pbId = idMap.councillors[supabaseId];
  if (!pbId) {
    console.error(`  ❌ ${name}: PocketBase ID not found in mapping`);
    return false;
  }

  // photo_url이 없으면 스킵
  if (!photo_url || photo_url.trim() === '') {
    console.log(`  ⏭️  ${name}: No photo URL (skipping)`);
    return true; // 에러는 아님
  }

  console.log(`  🖼️  ${name}: Migrating photo...`);
  console.log(`      URL: ${photo_url}`);

  try {
    // 1. 이미지 다운로드
    const imageData = await downloadImage(photo_url);
    if (!imageData) {
      console.error(`  ❌ ${name}: Download failed`);
      return false;
    }

    console.log(`      Downloaded: ${(imageData.buffer.length / 1024).toFixed(2)} KB`);

    // 2. PocketBase에 업로드
    const filename = getFilenameFromUrl(photo_url);
    const uploadedFilename = await uploadImageToPocketBase(
      pbId,
      imageData.buffer,
      filename,
      imageData.contentType
    );

    if (!uploadedFilename) {
      console.error(`  ❌ ${name}: Upload failed`);
      return false;
    }

    console.log(`      ✅ Uploaded: ${uploadedFilename}`);
    console.log(`      PB URL: ${POCKETBASE_URL}/api/files/councillors/${pbId}/${uploadedFilename}`);

    return true;
  } catch (error) {
    console.error(`  ❌ ${name}: Migration failed:`, error.message);
    return false;
  }
}

/**
 * 모든 이미지 마이그레이션
 */
async function migrateAllImages() {
  console.log('🚀 Starting image migration...');
  console.log(`🌐 PocketBase URL: ${POCKETBASE_URL}`);

  try {
    // 1. Admin 인증
    await authenticateAdmin();

    // 2. 데이터 로드
    const idMap = loadIdMapping();
    const councillors = loadCouncillors();

    // 3. 이미지가 있는 의원만 필터링
    const councillorsWithPhotos = councillors.filter(c => c.photo_url && c.photo_url.trim() !== '');
    console.log(`\n📊 Found ${councillorsWithPhotos.length} councillors with photos (out of ${councillors.length})`);

    if (councillorsWithPhotos.length === 0) {
      console.log('⚠️  No photos to migrate');
      return;
    }

    // 4. 하나씩 마이그레이션
    console.log('\n🖼️  Migrating photos...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const councillor of councillorsWithPhotos) {
      const result = await migrateCouncillorImage(councillor, idMap);

      if (result) {
        successCount++;
      } else {
        errorCount++;
      }

      // Rate limiting (PocketBase 서버 보호)
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms 대기
    }

    skippedCount = councillors.length - councillorsWithPhotos.length;

    // 5. 결과 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total councillors: ${councillors.length}`);
    console.log(`✅ Migrated: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`⏭️  Skipped (no photo): ${skippedCount}`);
    console.log('='.repeat(60));

    console.log('\n📝 Next Steps:');
    console.log('1. Verify images in PocketBase Admin UI:');
    console.log(`   ${POCKETBASE_URL}/_/`);
    console.log('2. Check councillor records');
    console.log('3. Update Next.js code to use PocketBase');
    console.log('   See POCKETBASE_MIGRATION_GUIDE.md section 5');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// 스크립트 실행
migrateAllImages()
  .then(() => {
    console.log('\n✅ Image migration script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Image migration script failed:', error);
    process.exit(1);
  });
