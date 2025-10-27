/**
 * Generate Encryption Key Script
 * 
 * This script generates a secure random encryption key for use with
 * the Account credentials encryption system.
 * 
 * Usage: node scripts/generate-encryption-key.js
 */

const crypto = require('crypto');

function generateEncryptionKey() {
  // Generate a 64-character random hex string (256 bits)
  const key = crypto.randomBytes(32).toString('hex');
  
  console.log('\n' + '='.repeat(80));
  console.log('🔐 ENCRYPTION KEY GENERATED');
  console.log('='.repeat(80));
  console.log('\nYour secure encryption key:');
  console.log('\n' + key);
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  IMPORTANT SECURITY INSTRUCTIONS');
  console.log('='.repeat(80));
  console.log(`
1. Copy the key above
2. Add it to your .env file as:
   ENCRYPTION_KEY=${key}
3. Add the SAME key to worker/.env file
4. NEVER commit this key to version control
5. Keep this key SECRET and SECURE
6. If you lose this key, you CANNOT decrypt existing data
7. Store a backup of this key in a secure password manager

⚠️  WARNING: If you change this key after creating accounts, 
   you won't be able to decrypt existing account credentials!
`);
  console.log('='.repeat(80) + '\n');
}

// Run the generator
generateEncryptionKey();

