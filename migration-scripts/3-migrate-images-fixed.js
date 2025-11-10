/**
 * PocketBase 이미지 마이그레이션 스크립트 (수정 버전)
 *
 * 사용법:
 * cd they_work_for_yongincitizen
 * node migration-scripts/3-migrate-images-fixed.js
 */

const PocketBase = require('pocketbase').default || require('pocketbase');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 환경 변수
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://theyworkforcitizen-api.duckdns.org';
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
  console.error('❌ Error: PocketBase admin credentials not found');
  process.exit(1);
}

// PocketBase 클라이언트
const pb = new PocketBase(POCKETBASE_URL);

// Export 디렉토리
const EXPORT_DIR = path.join(__dirname, '../exports');
const TEMP_DIR = path.join(__dirname, '../temp_images');

// 임시 디렉토리 생성
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

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
    process.exit(1);
  }

  const councillors = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📂 Loaded ${councillors.length} councillors`);
  return councillors;
}

/**
 * 이미지 다운로드 및 파일로 저장
 */
async function downloadImageToFile(url, filePath) {
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000,
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`  ❌ Download failed: ${error.message}`);
    return false;
  }
}

/**
 * PocketBase에 이미지 업로드 (파일 사용)
 */
async function uploadImageToPocketBase(pbId, filePath, originalFilename) {
  try {
    // FormData 생성 (브라우저 FormData)
    const formData = new FormData();

    // 파일 읽기
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

    // FormData에 추가
    formData.append('photo', blob, originalFilename);

    // PocketBase update
    const record = await pb.collection('councillors').update(pbId, formData);

    return record.photo;
  } catch (error) {
    console.error(`  ❌ Upload failed: ${error.message}`);

    // 대체 방법: fetch API 직접 사용
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

      const formData2 = new FormData();
      formData2.append('photo', blob, originalFilename);

      const response = await fetch(`${POCKETBASE_URL}/api/collections/councillors/records/${pbId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': pb.authStore.token,
        },
        body: formData2,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.photo;
    } catch (error2) {
      console.error(`  ❌ Alternative upload failed: ${error2.message}`);
      return null;
    }
  }
}

/**
 * 파일명 추출
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
    console.error(`  ❌ ${name}: PocketBase ID not found`);
    return false;
  }

  // photo_url이 없으면 스킵
  if (!photo_url || photo_url.trim() === '') {
    console.log(`  ⏭️  ${name}: No photo URL`);
    return true;
  }

  console.log(`  🖼️  ${name}: Migrating photo...`);

  try {
    // 1. 파일명 생성
    const originalFilename = getFilenameFromUrl(photo_url);
    const tempFilePath = path.join(TEMP_DIR, `${pbId}_${originalFilename}`);

    // 2. 이미지 다운로드
    console.log(`      Downloading from: ${photo_url}`);
    const downloaded = await downloadImageToFile(photo_url, tempFilePath);

    if (!downloaded) {
      console.error(`  ❌ ${name}: Download failed`);
      return false;
    }

    const fileSize = fs.statSync(tempFilePath).size;
    console.log(`      Downloaded: ${(fileSize / 1024).toFixed(2)} KB`);

    // 3. PocketBase에 업로드
    const uploadedFilename = await uploadImageToPocketBase(pbId, tempFilePath, originalFilename);

    if (!uploadedFilename) {
      console.error(`  ❌ ${name}: Upload failed`);
      // 임시 파일 삭제
      fs.unlinkSync(tempFilePath);
      return false;
    }

    console.log(`      ✅ Uploaded: ${uploadedFilename}`);

    // 임시 파일 삭제
    fs.unlinkSync(tempFilePath);

    return true;
  } catch (error) {
    console.error(`  ❌ ${name}: ${error.message}`);
    return false;
  }
}

/**
 * 모든 이미지 마이그레이션
 */
async function migrateAllImages() {
  console.log('🚀 Starting image migration (Fixed version)...');
  console.log(`🌐 PocketBase URL: ${POCKETBASE_URL}`);

  try {
    // 1. Admin 인증
    await authenticateAdmin();

    // 2. 데이터 로드
    const idMap = loadIdMapping();
    const councillors = loadCouncillors();

    // 3. 이미지가 있는 의원만 필터링
    const councillorsWithPhotos = councillors.filter(c => c.photo_url && c.photo_url.trim() !== '');
    console.log(`\n📊 Found ${councillorsWithPhotos.length} councillors with photos`);

    if (councillorsWithPhotos.length === 0) {
      console.log('⚠️  No photos to migrate');
      return;
    }

    // 4. 하나씩 마이그레이션
    console.log('\n🖼️  Migrating photos...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const councillor of councillorsWithPhotos) {
      const result = await migrateCouncillorImage(councillor, idMap);

      if (result) {
        successCount++;
      } else {
        errorCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    }

    // 5. 결과 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total: ${councillorsWithPhotos.length}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(60));

    // 임시 디렉토리 정리
    console.log('\n🧹 Cleaning up temporary files...');
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(TEMP_DIR, file));
      });
      fs.rmdirSync(TEMP_DIR);
      console.log('✅ Cleanup complete');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// 스크립트 실행
migrateAllImages()
  .then(() => {
    console.log('\n✅ Image migration completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Image migration failed:', error);
    process.exit(1);
  });
