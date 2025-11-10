/**
 * PocketBase 컬렉션 자동 생성 스크립트
 */

const PocketBase = require('pocketbase').default || require('pocketbase');

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://theyworkforcitizen-api.duckdns.org';
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
  console.error('❌ Error: PocketBase admin credentials not found');
  process.exit(1);
}

const pb = new PocketBase(POCKETBASE_URL);

async function createCollections() {
  console.log('🚀 Creating PocketBase collections...');

  try {
    await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
    console.log('✅ Admin authenticated');

    // 1. councillors
    console.log('\n📦 Creating councillors collection...');
    await pb.collections.create({
      name: 'councillors',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'name_en', type: 'text' },
        { name: 'councillor_type', type: 'select', options: {
          maxSelect: 1,
          values: ['국회의원', '경기도의원', '용인시의원']
        }},
        { name: 'party', type: 'text' },
        { name: 'district', type: 'text' },
        { name: 'photo', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } },
        { name: 'term_number', type: 'number' },
        { name: 'is_active', type: 'bool' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'office_location', type: 'text' },
        { name: 'profile_url', type: 'url' }
      ],
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null
    });
    console.log('✅ councillors created');

    // 2. committees
    console.log('\n📦 Creating committees collection...');
    await pb.collections.create({
      name: 'committees',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'name_en', type: 'text' },
        { name: 'type', type: 'select', options: {
          maxSelect: 1,
          values: ['상임위원회', '특별위원회']
        }},
        { name: 'description', type: 'editor' }
      ],
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null
    });
    console.log('✅ committees created');

    // Get collection IDs for relations
    const collections = await pb.collections.getFullList();
    const councillorsId = collections.find(c => c.name === 'councillors').id;
    const committeesId = collections.find(c => c.name === 'committees').id;

    // 3. councillor_committees
    console.log('\n📦 Creating councillor_committees collection...');
    await pb.collections.create({
      name: 'councillor_committees',
      type: 'base',
      schema: [
        { name: 'councillor', type: 'relation', options: {
          collectionId: councillorsId,
          cascadeDelete: true,
          maxSelect: 1
        }},
        { name: 'committee', type: 'relation', options: {
          collectionId: committeesId,
          cascadeDelete: true,
          maxSelect: 1
        }},
        { name: 'role', type: 'select', options: {
          maxSelect: 1,
          values: ['위원장', '부위원장', '위원']
        }},
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' }
      ],
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null
    });
    console.log('✅ councillor_committees created');

    // 4. meetings
    console.log('\n📦 Creating meetings collection...');
    await pb.collections.create({
      name: 'meetings',
      type: 'base',
      schema: [
        { name: 'title', type: 'text', required: true },
        { name: 'meeting_type', type: 'select', options: {
          maxSelect: 1,
          values: ['본회의', '상임위원회', '특별위원회']
        }},
        { name: 'committee', type: 'relation', options: {
          collectionId: committeesId,
          maxSelect: 1
        }},
        { name: 'meeting_date', type: 'date', required: true },
        { name: 'session_number', type: 'number' },
        { name: 'meeting_number', type: 'number' },
        { name: 'transcript_url', type: 'url' },
        { name: 'video_url', type: 'url' },
        { name: 'transcript_text', type: 'editor' },
        { name: 'is_processed', type: 'bool' }
      ],
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null
    });
    console.log('✅ meetings created');

    // 5. bills
    console.log('\n📦 Creating bills collection...');
    await pb.collections.create({
      name: 'bills',
      type: 'base',
      schema: [
        { name: 'bill_number', type: 'text', required: true, options: { min: null, max: null, pattern: '' } },
        { name: 'title', type: 'text', required: true },
        { name: 'bill_type', type: 'select', options: {
          maxSelect: 1,
          values: ['조례안', '예산안', '동의안', '결의안']
        }},
        { name: 'proposer', type: 'relation', options: {
          collectionId: councillorsId,
          maxSelect: 1
        }},
        { name: 'proposal_date', type: 'date' },
        { name: 'status', type: 'select', options: {
          maxSelect: 1,
          values: ['발의', '상정', '가결', '부결', '폐기']
        }},
        { name: 'result', type: 'select', options: {
          maxSelect: 1,
          values: ['원안가결', '수정가결', '부결']
        }},
        { name: 'summary', type: 'editor' },
        { name: 'full_text', type: 'editor' },
        { name: 'bill_url', type: 'url' }
      ],
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      indexes: ['CREATE UNIQUE INDEX idx_bill_number ON bills (bill_number)']
    });
    console.log('✅ bills created');

    // Get bills ID
    const collectionsUpdated = await pb.collections.getFullList();
    const billsId = collectionsUpdated.find(c => c.name === 'bills').id;

    // 6. bill_cosponsors
    console.log('\n📦 Creating bill_cosponsors collection...');
    await pb.collections.create({
      name: 'bill_cosponsors',
      type: 'base',
      schema: [
        { name: 'bill', type: 'relation', options: {
          collectionId: billsId,
          cascadeDelete: true,
          maxSelect: 1
        }},
        { name: 'councillor', type: 'relation', options: {
          collectionId: councillorsId,
          cascadeDelete: true,
          maxSelect: 1
        }}
      ],
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null
    });
    console.log('✅ bill_cosponsors created');

    // 7. speeches (Phase 2)
    console.log('\n📦 Creating speeches collection...');
    await pb.collections.create({
      name: 'speeches',
      type: 'base',
      schema: [
        { name: 'meeting', type: 'relation', options: {
          collectionId: collectionsUpdated.find(c => c.name === 'meetings').id,
          cascadeDelete: true,
          maxSelect: 1
        }},
        { name: 'councillor', type: 'relation', options: {
          collectionId: councillorsId,
          maxSelect: 1
        }},
        { name: 'speech_order', type: 'number' },
        { name: 'speech_text', type: 'editor', required: true },
        { name: 'summary', type: 'editor' },
        { name: 'keywords', type: 'json' },
        { name: 'timestamp_start', type: 'number' },
        { name: 'timestamp_end', type: 'number' }
      ],
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null
    });
    console.log('✅ speeches created');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All collections created successfully!');
    console.log('='.repeat(60));

    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run import');
    console.log('2. Run: npm run images');

  } catch (error) {
    if (error.status === 400 && error.data?.name?.message?.includes('already exists')) {
      console.log('ℹ️  Collection already exists, skipping...');
    } else {
      console.error('❌ Error:', error.message || error);
      throw error;
    }
  }
}

createCollections()
  .then(() => {
    console.log('\n✅ Collection creation completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Collection creation failed:', error);
    process.exit(1);
  });
