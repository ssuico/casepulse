# MongoDB Worker Integration

## Overview

The Seller Central Login worker has been enhanced to fetch account and brand credentials from MongoDB instead of relying solely on environment variables. This provides centralized credential management through the CasePulse web interface.

## Changes Made

### 1. Account Model Updates (`src/models/Account.ts`)

**Changed:**
- ❌ Removed password hashing (bcrypt)
- ❌ Removed 2FA key hashing
- ❌ Removed `comparePassword` method

**Why:**
- The automation worker needs plaintext credentials to perform actual logins
- Hashing is one-way and prevents credential retrieval
- Security is now managed through MongoDB access control

**Security Note:**
- Credentials are stored in plaintext in MongoDB
- Ensure MongoDB has proper authentication, network restrictions, and encryption at rest
- Limit worker access to read-only permissions

### 2. Worker Dependencies (`worker/package.json`)

**Added:**
- `mongoose` - MongoDB ODM for database connectivity

### 3. Worker Structure

**New Files:**
```
worker/
├── lib/
│   └── mongodb.js          # MongoDB connection utility
├── models/
│   ├── Account.js          # Account schema (JS version)
│   └── Brand.js            # Brand schema (JS version)
├── seller-central-login.js # Main worker (enhanced)
└── env.example             # Updated with MongoDB config
```

### 4. Worker Enhancements (`worker/seller-central-login.js`)

**New Functions:**

1. **`loadConfiguration()`**
   - Connects to MongoDB
   - Fetches credentials based on environment variables
   - Falls back to legacy env vars if no MongoDB IDs provided

2. **`fetchAccountFromDB(accountId)`**
   - Retrieves account credentials by MongoDB ObjectId
   - Includes password and twoFAKey fields

3. **`fetchBrandsFromDB(accountId)`**
   - Retrieves all brands for a given account
   - Returns a map of brand names to URLs

4. **`fetchBrandFromDB(brandId)`**
   - Retrieves a specific brand with populated account credentials
   - Used for single-brand operations

**Configuration Priority:**
1. `BRAND_ID` - Fetch specific brand + account
2. `ACCOUNT_ID` - Fetch account + all brands
3. `ACCOUNT_NAME` - Search by name, fetch account + all brands
4. Legacy env vars - Fallback to `SC_ACCOUNT_CP_*` variables

### 5. Environment Configuration (`worker/env.example`)

**New Variables:**
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/casepulse

# Operation Modes
ACCOUNT_ID=        # Primary: MongoDB Account ID
ACCOUNT_NAME=      # Fallback: Account name
BRAND_ID=          # Alternative: Specific brand ID
```

**Legacy Variables (Fallback):**
```env
SC_ACCOUNT_CP_USERNAME=
SC_ACCOUNT_CP_PASSWORD=
SC_ACCOUNT_CP_2FAKEY=
SC_BRAND_CP_*=
```

## Operation Modes

### Mode 1: Account ID (Recommended)
```bash
MONGODB_URI=mongodb://localhost:27017/casepulse
ACCOUNT_ID=6123456789abcdef12345678
```
✅ Fetches account credentials and all associated brands

### Mode 2: Brand ID
```bash
MONGODB_URI=mongodb://localhost:27017/casepulse
BRAND_ID=6123456789abcdef87654321
```
✅ Fetches specific brand and its account credentials

### Mode 3: Account Name (Fallback)
```bash
MONGODB_URI=mongodb://localhost:27017/casepulse
ACCOUNT_NAME=CP Account
```
✅ Searches for account by name and fetches all brands

### Mode 4: Legacy (Environment Variables)
```bash
SC_ACCOUNT_CP_USERNAME=email@example.com
SC_ACCOUNT_CP_PASSWORD=password123
SC_ACCOUNT_CP_2FAKEY=JBSWY3DPEHPK3PXP
```
⚠️ Uses environment variables directly (no MongoDB)

## Database Schema

### Accounts Collection
```javascript
{
  _id: ObjectId("6123..."),
  accountName: "CP Account",
  username: "email@example.com",
  password: "plaintext_password",      // NOT HASHED
  twoFAKey: "JBSWY3DPEHPK3PXP",       // NOT HASHED
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

### Brands Collection
```javascript
{
  _id: ObjectId("6789..."),
  brandName: "RefrigiWear US",
  sellerCentralAccountId: ObjectId("6123..."),
  brandUrl: "https://sellercentral.amazon.com/home?mons_sel_mkid=...",
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

### PuppeteerConfig Collection (NEW!)
```javascript
{
  _id: ObjectId("abc..."),
  headless: true,                      // Run browser in headless mode
  timeout: 180000,                     // Worker timeout in milliseconds
  sellerCentralUrl: "https://sellercentral.amazon.com/home",
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```
**Note:** Only one document should exist in this collection (global configuration)

## Usage Examples

### Example 1: Login to All Brands for an Account
```bash
cd worker
echo "MONGODB_URI=mongodb://localhost:27017/casepulse" > .env
echo "ACCOUNT_ID=6123456789abcdef12345678" >> .env
echo "HEADLESS=false" >> .env
npm start
```

### Example 2: Login to Specific Brand
```bash
cd worker
echo "MONGODB_URI=mongodb://localhost:27017/casepulse" > .env
echo "BRAND_ID=6789012345abcdef12345678" >> .env
echo "HEADLESS=false" >> .env
npm start
```

### Example 3: API Trigger (from Next.js)
```javascript
// In your API route
const { spawn } = require('child_process');

const worker = spawn('node', ['seller-central-login.js'], {
  cwd: './worker',
  env: {
    ...process.env,
    MONGODB_URI: process.env.MONGODB_URI,
    ACCOUNT_ID: '6123456789abcdef12345678',
    HEADLESS: 'true'
  }
});
```

## Migration Guide

### Step 1: Update Existing Accounts
If you have accounts in the database with hashed passwords, you'll need to update them:

```javascript
// In MongoDB shell or through your app
db.accounts.updateOne(
  { accountName: "CP Account" },
  { 
    $set: { 
      password: "plaintext_password",      // Replace with actual password
      twoFAKey: "JBSWY3DPEHPK3PXP"        // Replace with actual 2FA key
    } 
  }
);
```

### Step 2: Update Worker Environment
```bash
cd worker
cp env.example .env
# Edit .env with your MongoDB URI and desired operation mode
```

### Step 3: Test Worker
```bash
cd worker
npm start
```

## Security Considerations

### ⚠️ CRITICAL SECURITY NOTES

1. **Plaintext Credentials**
   - Credentials are stored in plaintext for automation
   - This is necessary but requires strict MongoDB security

2. **MongoDB Security Checklist**
   - ✅ Enable authentication (username/password)
   - ✅ Use network restrictions (bind to localhost or VPC)
   - ✅ Enable TLS/SSL for connections
   - ✅ Enable encryption at rest
   - ✅ Use read-only user for worker
   - ✅ Monitor access logs
   - ✅ Regular credential rotation

3. **Recommended MongoDB User for Worker**
```javascript
db.createUser({
  user: "casepulse_worker",
  pwd: "strong_password",
  roles: [
    { role: "read", db: "casepulse" }  // Read-only access
  ]
});
```

4. **Environment Variable Security**
   - Never commit `.env` files
   - Use secrets manager in production (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotate MONGODB_URI credentials regularly

## Benefits

✅ **Centralized Management** - Credentials managed through CasePulse UI
✅ **Multi-Account Support** - Easy switching between accounts
✅ **Brand Association** - Brands linked to accounts automatically
✅ **API Integration** - Worker can be triggered with account/brand IDs
✅ **Backward Compatible** - Falls back to env vars if needed
✅ **Audit Trail** - MongoDB timestamps track credential updates

## Troubleshooting

### "Account not found with ID"
- Verify the ACCOUNT_ID or BRAND_ID is correct
- Check MongoDB connection
- Ensure the document exists in the database

### "Missing required configuration"
- Check that account has username, password, and twoFAKey set
- Verify fields are not empty strings
- Ensure MongoDB connection is working

### "MongoDB connection failed"
- Verify MONGODB_URI is correct
- Check MongoDB is running
- Test connection with: `mongosh "mongodb://localhost:27017/casepulse"`

### "Password/2FA still hashed"
- Old accounts may have hashed credentials
- Update them to plaintext (see Migration Guide)
- Create new accounts through the UI

## Puppeteer Configuration Management

### Overview
The new **Puppeteer Configuration** page (`/puppeteer-config`) allows you to manage global worker settings through the CasePulse web interface.

### Configuration Options

1. **Headless Mode** (boolean)
   - `true`: Browser runs without visible window (production mode)
   - `false`: Browser is visible (debug mode)
   - Default: `true`

2. **Timeout** (number)
   - Maximum worker execution time in milliseconds
   - Range: 30000ms - 600000ms
   - Default: `180000` (3 minutes)

3. **Seller Central URL** (string)
   - Initial navigation URL for the worker
   - Default: `https://sellercentral.amazon.com/home`

### How It Works

1. **UI Management**: Configure settings through `/puppeteer-config` page
2. **MongoDB Storage**: Settings saved to `puppeteerconfigs` collection
3. **Worker Integration**: Worker fetches config on startup
4. **Environment Override**: Environment variables can override DB settings

### Priority Order

The worker applies configuration in this priority:
1. **Environment Variables** (highest priority)
   - `HEADLESS=true/false`
   - `TIMEOUT_MS=180000`
2. **MongoDB Configuration**
   - Values from `puppeteerconfigs` collection
3. **Hardcoded Defaults** (lowest priority)
   - Used if MongoDB is unavailable

### Example Usage

```javascript
// Configuration is automatically loaded by worker
// No code changes needed - just update via UI!

// Or override via environment variables:
HEADLESS=false npm start  // Forces headless off for debugging
```

## Future Enhancements

- [x] Puppeteer configuration management UI
- [ ] Per-account configuration overrides
- [ ] Per-brand configuration overrides
- [ ] Encryption at application level (encrypt/decrypt on read/write)
- [ ] Key rotation automation
- [ ] Audit logging for credential access
- [ ] Multi-region MongoDB replication
- [ ] Credential expiry/rotation reminders

## Rollback Plan

If you need to revert to environment variables only:

1. Set no MongoDB IDs in `.env`
2. Add legacy variables:
   ```env
   SC_ACCOUNT_CP_USERNAME=...
   SC_ACCOUNT_CP_PASSWORD=...
   SC_ACCOUNT_CP_2FAKEY=...
   ```
3. Worker will automatically fall back to env vars

---

**Date:** October 27, 2025
**Author:** AI Assistant
**Status:** ✅ Complete

