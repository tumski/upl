import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

console.log('\nEnvironment loading debug:');
console.log('Script directory:', __dirname);
console.log('Resolved .env path:', envPath);
console.log('File exists:', require('fs').existsSync(envPath));

const result = config({ path: envPath, debug: true });

if (result.error) {
  console.error('\n❌ Error loading .env file:', result.error);
  process.exit(1);
}

const requiredEnvVars = [
  'DATABASE_URL',
  'TOPAZ_API_KEY',
  'BLOB_READ_WRITE_TOKEN'
];

const missingEnvVars = requiredEnvVars.filter(
  envVar => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`);
  });
  console.error('\nMake sure your .env file contains all required variables and is being loaded correctly.');
  console.error('Current environment path:', envPath);
  process.exit(1);
}

console.log('\nEnvironment loaded:', {
  loaded: result.parsed ? Object.keys(result.parsed).length : 0,
  databaseUrl: process.env.DATABASE_URL?.substring(0, 10) + '...',
  topazKey: process.env.TOPAZ_API_KEY ? 'present' : 'missing',
  blobToken: process.env.BLOB_READ_WRITE_TOKEN ? 'present' : 'missing'
});
