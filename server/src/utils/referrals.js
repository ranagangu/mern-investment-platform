import crypto from 'crypto';
import { User } from '../models/index.js';

export async function createUniqueReferralCode(name) {
  const base = name.replace(/[^a-z0-9]/gi, '').slice(0, 5).toUpperCase() || 'USER';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referralCode = `${base}${suffix}`;
    const exists = await User.exists({ referralCode });
    if (!exists) return referralCode;
  }

  return crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
}

export function buildReferralPath(referrer) {
  if (!referrer) return [];
  return [referrer._id, ...referrer.referralPath].slice(0, 5);
}
