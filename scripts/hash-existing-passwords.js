/**
 * Migration Script: Hash Existing Plain Text Passwords
 * 
 * This script will find all users with plain text passwords and hash them.
 * Run this once to fix existing users in the database.
 * 
 * Usage: node scripts/hash-existing-passwords.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - UPDATE THIS with your connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casepulse';

// User Schema (minimal version for migration)
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function hashExistingPasswords() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('+password');
    console.log(`📊 Found ${users.length} users in database\n`);

    let hashedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isAlreadyHashed = /^\$2[ayb]\$.{56}$/.test(user.password);

      if (isAlreadyHashed) {
        console.log(`⏭️  Skipping ${user.username} - password already hashed`);
        skippedCount++;
      } else {
        console.log(`🔐 Hashing password for ${user.username}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Update the password directly in the database
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        console.log(`✅ Successfully hashed password for ${user.username}`);
        hashedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 Migration Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Passwords hashed: ${hashedCount}`);
    console.log(`   Already hashed (skipped): ${skippedCount}`);
    console.log('='.repeat(50));
    console.log('\n✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the migration
hashExistingPasswords();

