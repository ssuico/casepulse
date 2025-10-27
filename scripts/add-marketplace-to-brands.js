/**
 * Migration Script: Add Marketplace Field to Existing Brands
 * 
 * This script adds the 'marketplace' field to all existing brands in the database
 * and sets the default value to 'US' for brands that don't have it.
 * 
 * Usage:
 *   node scripts/add-marketplace-to-brands.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from the root .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

Object.keys(envVars).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = envVars[key];
  }
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Brand Schema (simplified for migration)
const BrandSchema = new mongoose.Schema({
  brandName: String,
  sellerCentralAccountId: mongoose.Schema.Types.ObjectId,
  brandUrl: String,
  marketplace: {
    type: String,
    enum: ['US', 'Canada', 'Mexico'],
    default: 'US',
  },
  cookies: String,
  cookiesUpdatedAt: Date,
}, {
  timestamps: true,
});

const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);

async function addMarketplaceToBrands() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all brands without marketplace field or with null/undefined marketplace
    console.log('🔍 Finding brands without marketplace field...');
    const brandsWithoutMarketplace = await Brand.find({
      $or: [
        { marketplace: { $exists: false } },
        { marketplace: null },
        { marketplace: '' }
      ]
    });

    console.log(`📊 Found ${brandsWithoutMarketplace.length} brand(s) without marketplace field\n`);

    if (brandsWithoutMarketplace.length === 0) {
      console.log('✅ All brands already have marketplace field. Nothing to update.');
      return;
    }

    // Update each brand
    let successCount = 0;
    let failCount = 0;

    for (const brand of brandsWithoutMarketplace) {
      try {
        await Brand.updateOne(
          { _id: brand._id },
          { $set: { marketplace: 'US' } }
        );
        console.log(`✅ Updated brand: ${brand.brandName} (ID: ${brand._id}) -> Marketplace: US`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update brand: ${brand.brandName} (ID: ${brand._id})`);
        console.error(`   Error: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} brand(s)`);
    if (failCount > 0) {
      console.log(`❌ Failed to update: ${failCount} brand(s)`);
    }
    console.log('='.repeat(60));

    // Verify all brands now have marketplace
    const remainingBrandsWithoutMarketplace = await Brand.countDocuments({
      $or: [
        { marketplace: { $exists: false } },
        { marketplace: null },
        { marketplace: '' }
      ]
    });

    if (remainingBrandsWithoutMarketplace === 0) {
      console.log('\n✅ Migration completed successfully! All brands now have marketplace field.');
    } else {
      console.log(`\n⚠️ Warning: ${remainingBrandsWithoutMarketplace} brand(s) still without marketplace field.`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
console.log('🚀 Starting marketplace field migration...\n');
addMarketplaceToBrands().then(() => {
  console.log('\n✅ Migration script completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Migration script failed:', error);
  process.exit(1);
});

