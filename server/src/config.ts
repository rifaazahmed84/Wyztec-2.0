import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
export const config = {
  port: Number(process.env.PORT || 3001),
  production: process.env.NODE_ENV === 'production' || process.argv.includes('--production'),
  origins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  siteUrl: process.env.SITE_URL || 'https://wyztec.com',
  dataDir: process.env.SUBMISSIONS_DIR || fileURLToPath(new URL('../data', import.meta.url)),
};
