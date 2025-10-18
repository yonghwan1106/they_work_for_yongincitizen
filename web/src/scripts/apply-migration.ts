import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Required environment variables are missing');
  process.exit(1);
}

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
      console.error('Error adding column:', addColumnError);
      return;
    }

    console.log('✓ Column added successfully');

    // Step 2: Update existing records
    console.log('Step 2: Updating existing records...');
    const { error: updateError } = await supabase
      .from('councillors')
      .update({ councillor_type: '용인시의원' })
      .is('councillor_type', null);

    if (updateError) {
      console.error('Error updating records:', updateError);
      return;
    }

    console.log('✓ Migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyMigration();
