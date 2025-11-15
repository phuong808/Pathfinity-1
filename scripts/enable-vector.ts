import { sql } from 'drizzle-orm';
import { db } from '@/app/db';

async function enableVectorExtension() {
  console.log('🔌 Enabling pgvector extension...');
  
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
    console.log('✅ pgvector extension enabled successfully');
  } catch (error) {
    console.error('❌ Error enabling pgvector extension:', error);
    console.log('\nNote: If you get a permission error, you may need to run this manually:');
    console.log('  psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"');
    process.exit(1);
  }
}

enableVectorExtension();
