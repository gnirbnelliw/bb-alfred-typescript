import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config({ path: 'scripts/.env' });

console.log('🔥 Dotenv');

const syncFrom = process.env.SYNC_FROM;
const syncTo = process.env.SYNC_TO;

if (!syncFrom || !syncTo) {
  console.error('❌ SYNC_FROM and SYNC_TO must be defined in the .env file');
  process.exit(1);
}

// Use shell command to copy recursively
console.log(`🔄 Syncing from ${syncFrom} to ${syncTo}`);
try {
  execSync(`cp -R "${syncFrom}/dist" "${syncTo}"`, { stdio: 'inherit' });
  console.log('✅ Copy complete!');
} catch (err) {
  console.error('❌ Copy failed:', err);
  process.exit(1);
}

console.log('Done syncing Alfred Workflow!');
