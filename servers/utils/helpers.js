import bcrypt from 'bcrypt';

export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}