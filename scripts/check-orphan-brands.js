/**
 * Check for Orphan Brands Script
 * 
 * This script finds brands that reference non-existent accounts.
 * Useful for identifying data integrity issues.
 * 
 * Usage: node scripts/check-orphan-brands.js
 */

const mongoose = require('mongoose');

// Try to load dotenv if available
try {
  require('dotenv').config();
} catch (e) {
  console.log('Note: dotenv not found, using environment variables or default');
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casepulse';

// Brand Schema
const BrandSchema = new mongoose.Schema({
  brandName: String,
  sellerCentralAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  },
  brandUrl: String,
}, { timestamps: true });

const Brand = mongoose.model('Brand', BrandSchema);

// Account Schema
const AccountSchema = new mongoose.Schema({
  accountName: String,
}, { timestamps: true });

const Account = mongoose.model('Account', AccountSchema);

async function checkOrphanBrands() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all brands
    const brands = await Brand.find({});
    console.log(`📊 Found ${brands.length} total brands\n`);

    if (brands.length === 0) {
      console.log('No brands found in database.');
      await mongoose.connection.close();
      return;
    }

    let orphanCount = 0;
    const orphanBrands = [];

    for (const brand of brands) {
      if (!brand.sellerCentralAccountId) {
        console.log(`⚠️  Brand "${brand.brandName}" has NO account reference`);
        orphanBrands.push(brand);
        orphanCount++;
        continue;
      }

      // Check if the account exists
      const account = await Account.findById(brand.sellerCentralAccountId);
      if (!account) {
        console.log(`❌ Brand "${brand.brandName}" references non-existent account (${brand.sellerCentralAccountId})`);
        orphanBrands.push(brand);
        orphanCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 Summary:');
    console.log(`   Total brands: ${brands.length}`);
    console.log(`   Valid brands: ${brands.length - orphanCount}`);
    console.log(`   Orphan brands: ${orphanCount}`);
    console.log('='.repeat(60));

    if (orphanCount > 0) {
      console.log('\n⚠️  Action Required:');
      console.log('These brands need to be either:');
      console.log('1. Assigned to a valid account, OR');
      console.log('2. Deleted if no longer needed\n');
      
      console.log('Orphan Brand IDs:');
      orphanBrands.forEach(b => console.log(`  - ${b._id} (${b.brandName})`));
    } else {
      console.log('\n✅ All brands have valid account references!');
    }

  } catch (error) {
    console.error('\n❌ Check failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the check
checkOrphanBrands();

