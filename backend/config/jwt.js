/**
 * Centralized JWT secret resolution.
 *
 * In production a real JWT_SECRET is mandatory — the server refuses to start
 * without one so we never silently sign tokens with a publicly-known fallback.
 * In development we allow an ephemeral random secret (logged once) so local
 * runs work without extra setup, at the cost of invalidating tokens on restart.
 */
const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (isProduction) {
    console.error('❌ FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
  JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn(
    '⚠️  JWT_SECRET not set — using a random ephemeral secret for development. ' +
    'Tokens will be invalidated on every restart. Set JWT_SECRET in your .env to persist sessions.'
  );
}

module.exports = { JWT_SECRET };
