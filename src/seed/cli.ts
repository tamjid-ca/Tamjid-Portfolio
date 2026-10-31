import { disconnectFromDatabase } from '@/lib/mongodb/connection';
import { seedDatabase } from './seed-database';

async function main() {
  try {
    const summary = await seedDatabase();
    console.log('Seed completed successfully:', JSON.stringify(summary, null, 2));
  } finally {
    await disconnectFromDatabase();
  }
}

main().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
