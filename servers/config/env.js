import dotenv from 'dotenv';
dotenv.config();

export const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
export const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
export const PORT = process.env.PORT || 3001;

console.log('🤖 Mistral AI initialized:', !!MISTRAL_API_KEY ? 'YES ✅' : 'NO ❌');

if (!MISTRAL_API_KEY) {
  console.error('❌ WARNING: MISTRAL_API_KEY not set! Chat will not work.');
}