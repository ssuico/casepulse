/**
 * Migration Script: Encrypt Existing Account Credentials
 * 
 * This script encrypts plaintext passwords and 2FA keys in the Accounts collection.
 * Run this ONCE after setting up encryption.
 * 
 * Prerequisites:
 * 1. Set ENCRYPTION_KEY in your .env file
 * 2. Set MONGODB_URI in your .env file
 * 
 * Usage: node scripts/encrypt-existing-accounts.js
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casepulse';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Encryption configuration (must match src/lib/crypto.ts)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Derives a key from the encryption key using PBKDF2
 */
const deriveKey = (salt) => {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables');
  }
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, KEY_LENGTH, 'sha256');
};

/**
 * Encrypts a string value
 */
const encrypt = (text) => {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return [
    salt.toString('hex'),
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted
  ].join(':');
};

/**
 * Checks if a string appears to be encrypted
 */
const isEncrypted = (text) => {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 4 && parts.every(part => /^[0-9a-f]+$/i.test(part));
};

// Account Schema (minimal version for migration)
const AccountSchema = new mongoose.Schema({
  accountName: String,
  username: String,
  password: { type: String, select: false },
  twoFAKey: { type: String, select: false },
}, { timestamps: true });

const Account = mongoose.model('Account', AccountSchema);

async function encryptExistingAccounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if encryption key is set
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
      throw new Error('ENCRYPTION_KEY must be set and at least 32 characters long');
    }
    console.log('✅ Encryption key validated\n');

    // Get all accounts with password and 2FA key
    const accounts = await Account.find({}).select('+password +twoFAKey');
    console.log(`📊 Found ${accounts.length} accounts in database\n`);

    let encryptedCount = 0;
    let skippedCount = 0;

    for (const account of accounts) {
      console.log(`\n🔍 Processing account: ${account.accountName}`);
      
      let needsUpdate = false;
      const updates = {};

      // Check and encrypt password
      if (account.password) {
        if (isEncrypted(account.password)) {
          console.log('   ⏭️  Password already encrypted');
        } else {
          console.log('   🔐 Encrypting password...');
          updates.password = encrypt(account.password);
          needsUpdate = true;
        }
      }

      // Check and encrypt 2FA key
      if (account.twoFAKey) {
        if (isEncrypted(account.twoFAKey)) {
          console.log('   ⏭️  2FA key already encrypted');
        } else {
          console.log('   🔐 Encrypting 2FA key...');
          updates.twoFAKey = encrypt(account.twoFAKey);
          needsUpdate = true;
        }
      }

      // Update if needed
      if (needsUpdate) {
        await Account.findByIdAndUpdate(account._id, updates);
        console.log('   ✅ Successfully encrypted credentials');
        encryptedCount++;
      } else {
        console.log('   ⏭️  No encryption needed (already encrypted)');
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 Migration Summary:');
    console.log(`   Total accounts: ${accounts.length}`);
    console.log(`   Accounts encrypted: ${encryptedCount}`);
    console.log(`   Already encrypted (skipped): ${skippedCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the migration
encryptExistingAccounts();

