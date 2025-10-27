/**
 * Migration Script: Add cookiesUpdatedAt timestamp to existing brands with cookies
 * 
 * This script updates all brands that have cookies set but don't have a cookiesUpdatedAt timestamp.
 * It sets the cookiesUpdatedAt to the brand's updatedAt timestamp as a reasonable default.
 * 
 * Run this script once after deploying the cookiesUpdatedAt field changes.
 */

const mongoose = require('mongoose');
const Brand = require('../src/models/Brand').default;

// MongoDB connection string - update this to match your environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casepulse';

async function migrateCookiesTimestamp() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!\n');

    // Find all brands that have cookies but no cookiesUpdatedAt timestamp
    const brandsWithCookies = await Brand.find({
      cookies: { $exists: true, $ne: '' },
      cookiesUpdatedAt: { $exists: false }
    });

    console.log(`Found ${brandsWithCookies.length} brands with cookies but no cookiesUpdatedAt timestamp.\n`);

    if (brandsWithCookies.length === 0) {
      console.log('No migration needed. All brands with cookies already have timestamps.');
      await mongoose.connection.close();
      return;
    }

    // Update each brand
    let updatedCount = 0;
    for (const brand of brandsWithCookies) {
      await Brand.findByIdAndUpdate(brand._id, {
        cookiesUpdatedAt: brand.updatedAt
      });
      updatedCount++;
      console.log(`✓ Updated ${brand.brandName} (${updatedCount}/${brandsWithCookies.length})`);
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} brands.`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the migration
migrateCookiesTimestamp();

