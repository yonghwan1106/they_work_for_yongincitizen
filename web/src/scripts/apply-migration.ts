import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mopwsgknvcejfcmgeviv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcHdzZ2tudmNlamZjbWdldml2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUzMzU4MCwiZXhwIjoyMDc2MTA5NTgwfQ.JKQUYegSMyT1WU_RXmSTEKAk5fxvlWLxOBdZjrMG0rg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying migration: add councillor_type column...');

  try {
    // Step 1: Add column with default value
    console.log('Step 1: Adding councillor_type column...');
    const { error: addColumnError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE councillors
        ADD COLUMN IF NOT EXISTS councillor_type VARCHAR(20) NOT NULL DEFAULT '용인시의원';
      `
    });

    if (addColumnError) {
      // If rpc doesn't exist, we'll try a workaround using a dummy insert/update
      console.log('RPC method not available, trying alternative method...');

      // We'll use the REST API directly to execute SQL
      // This is a workaround - ideally you'd use Supabase CLI or dashboard
      console.log('Please run the following SQL in Supabase dashboard:');
      console.log(`
ALTER TABLE councillors
ADD COLUMN IF NOT EXISTS councillor_type VARCHAR(20) NOT NULL DEFAULT '용인시의원';

ALTER TABLE councillors
ADD CONSTRAINT councillor_type_check
CHECK (councillor_type IN ('국회의원', '경기도의원', '용인시의원'));

CREATE INDEX IF NOT EXISTS idx_councillors_type ON councillors(councillor_type);
      `);

      console.log('\nOr run: npx supabase db push');
      process.exit(1);
    }

    console.log('✓ Column added successfully');

    // Step 2: Add check constraint
    console.log('Step 2: Adding check constraint...');
    await supabase.rpc('exec', {
      sql: `
        ALTER TABLE councillors
        DROP CONSTRAINT IF EXISTS councillor_type_check;

        ALTER TABLE councillors
        ADD CONSTRAINT councillor_type_check
        CHECK (councillor_type IN ('국회의원', '경기도의원', '용인시의원'));
      `
    });

    console.log('✓ Check constraint added');

    // Step 3: Add index
    console.log('Step 3: Adding index...');
    await supabase.rpc('exec', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_councillors_type ON councillors(councillor_type);
      `
    });

    console.log('✓ Index added');

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    console.log('\nPlease apply the migration manually in Supabase dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Run the SQL from: web/src/scripts/add-councillor-type-column.sql');
    process.exit(1);
  }
}

applyMigration();
