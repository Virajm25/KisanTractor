import 'dotenv/config';
import { connect, seed, close } from './db.js';

try {
  await connect();
  const n = await seed({ force: true });
  console.log(`Seeded ${n} documents into "${process.env.DB_NAME || 'kisantractor'}".`);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await close();
}
