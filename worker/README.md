# Amazon Seller Central Automation Worker

A robust Puppeteer-based worker that automates login to Amazon Seller Central with 2FA authentication and navigates to multiple brand accounts. **Now with MongoDB integration!**

## Features

- ✅ **100% MongoDB-based credential management** - All credentials stored securely in database
- ✅ **API-triggered automation** - Run worker from the UI with one click
- ✅ Automated login with username/password
- ✅ 2FA code generation using TOTP (otplib)
- ✅ Multi-brand account switching
- ✅ Comprehensive error handling
- ✅ Structured logging and status reporting
- ✅ Headless/headed mode toggle
- ✅ Timeout protection (configurable via UI)
- ✅ Two operation modes (Account ID or Brand ID)

## Installation

```bash
cd worker
npm install
```

## Configuration

### 1. Copy the example environment file:
```bash
cp env.example .env
```

### 2. Configure MongoDB Connection

The worker fetches **all credentials and settings from MongoDB**. Only the MongoDB connection string is required:

```env
# Required: MongoDB connection
MONGODB_URI=mongodb://localhost:27017/casepulse

# Optional: Override Puppeteer settings for testing
HEADLESS=false
TIMEOUT_MS=180000
```

### 3. Operation Modes

The worker is typically **triggered from the UI** (Brands & Accounts page), but can also be run manually:

#### **Mode 1: Trigger for Specific Brand (Most Common via UI)**
```bash
BRAND_ID=6123456789abcdef87654321 npm start
```
✅ Fetches the brand and its account credentials from MongoDB  
✅ Logs in and navigates directly to that brand's page  
✅ This is what happens when you click the Play button in the UI

#### **Mode 2: Trigger for All Brands in Account**
```bash
ACCOUNT_ID=6123456789abcdef12345678 npm start
```
✅ Fetches account credentials from MongoDB  
✅ Fetches all brands for that account  
✅ Logs in and opens all brand pages in separate tabs

### Getting Your 2FA Secret Key

When setting up 2FA on Amazon Seller Central:
1. Choose "Authenticator app" option
2. Click "Can't scan the barcode?"
3. Copy the secret key shown (e.g., `JBSWY3DPEHPK3PXP`)
4. Store this in the **Accounts** page in the UI when creating/editing an account

## Usage

### Option 1: Trigger from UI (Recommended)
1. Go to **Brands & Accounts** page
2. Find the brand you want to login to
3. Click the **green Play button** (▶️)
4. The worker starts automatically and opens the browser

### Option 2: Run Manually (For Testing)
```bash
# For a specific brand
BRAND_ID=your_brand_id npm start

# For all brands in an account
ACCOUNT_ID=your_account_id npm start
```

### Development Mode (with browser visible):
Set `HEADLESS=false` in `.env` to see the browser automation in action.

### Production Mode (headless):
Set `HEADLESS=true` in `.env` or configure via the **Puppeteer Configuration** page in the UI.

## MongoDB Schema

The worker uses the following MongoDB collections:

### Accounts Collection
```javascript
{
  _id: ObjectId,
  accountName: "CP Account",
  username: "email@example.com",
  password: "plain_text_password",  // Stored as plaintext for automation
  twoFAKey: "JBSWY3DPEHPK3PXP",    // TOTP secret key
  createdAt: Date,
  updatedAt: Date
}
```

### Brands Collection
```javascript
{
  _id: ObjectId,
  brandName: "RefrigiWear US",
  sellerCentralAccountId: ObjectId("6123..."),  // Reference to Account
  brandUrl: "https://sellercentral.amazon.com/home?mons_sel_mkid=...",
  createdAt: Date,
  updatedAt: Date
}
```

**Security Note:** Credentials are stored in plaintext in MongoDB for automation purposes. Ensure MongoDB access is properly secured with authentication, network restrictions, and encryption at rest.

## Output

### Success Response:
```json
{
  "success": true,
  "message": "Login and brand navigation completed",
  "brandsLoaded": ["REFRIGIWEAR_US", "BABYEXPERT_US"],
  "duration": "45.23s"
}
```

### Error Response:
```json
{
  "success": false,
  "step": "login",
  "message": "Invalid credentials or 2FA code"
}
```

## Error Handling

The worker handles various error scenarios:

- ❌ Missing environment variables
- ❌ Invalid credentials
- ❌ Incorrect 2FA code
- ❌ CAPTCHA detection
- ❌ Network timeouts
- ❌ Page navigation failures
- ❌ Unexpected Amazon verification prompts

All errors are logged with context and the browser is closed gracefully.

## Architecture

### Main Functions:

- `loadConfiguration()` - **NEW!** Fetches credentials from MongoDB or falls back to env vars
- `fetchAccountFromDB(accountId)` - **NEW!** Retrieves account credentials from MongoDB
- `fetchBrandsFromDB(accountId)` - **NEW!** Retrieves all brands for an account
- `fetchBrandFromDB(brandId)` - **NEW!** Retrieves a specific brand with account credentials
- `validateConfiguration()` - Ensures all required config values are present
- `login(page)` - Handles the complete login flow with 2FA
- `navigateBrand(page, brandName, brandUrl)` - Opens brand URLs in new tabs
- `main()` - Orchestrates the entire workflow

### Configuration Flow:

1. **Load from MongoDB** (Priority Order):
   - Brand ID → Fetch specific brand + account credentials
   - Account ID → Fetch account credentials + all brands for that account
   - **No fallback** - Worker requires BRAND_ID or ACCOUNT_ID
   
2. **Puppeteer Settings**:
   - Fetched from MongoDB (PuppeteerConfig collection)
   - Can be overridden by HEADLESS and TIMEOUT_MS env vars for testing

### Error Recovery:

- Each async operation wrapped in try/catch
- Timeout protection on all selector waits
- Graceful browser cleanup in finally blocks
- Structured error objects for debugging

## Best Practices Implemented

✅ Uses `waitForSelector` instead of arbitrary delays
✅ Modular function architecture
✅ Comprehensive error handling at every step
✅ Anti-detection measures (user agent, webdriver property removal)
✅ Timeout protection to prevent hanging
✅ Browser cleanup in all scenarios
✅ Detailed logging for debugging

## Troubleshooting

### CAPTCHA Detected
If Amazon shows a CAPTCHA, you'll need to:
1. Run with `HEADLESS=false`
2. Manually solve the CAPTCHA
3. Consider using residential proxies or reducing request frequency

### Login Loop
If stuck in a login loop:
- Verify your credentials are correct
- Check that your 2FA key is valid
- Ensure time synchronization on your system (TOTP is time-based)

### Timeout Errors
If operations timeout:
- Increase `TIMEOUT_MS` in `.env`
- Check your internet connection
- Verify Amazon Seller Central is accessible

### Invalid 2FA Code
If 2FA codes don't work:
- Verify the secret key is correct (no spaces)
- Check system time is synchronized
- Try generating a code manually with an authenticator app

## Future Enhancements

- [ ] Session cookie persistence for faster re-login
- [ ] Multi-account support (loop through multiple credentials)
- [ ] Screenshot capture on errors
- [ ] Slack/email notifications on failure
- [ ] Proxy support for residential IPs
- [ ] Retry logic with exponential backoff

## Security Notes

⚠️ **Never commit your `.env` file to version control**
⚠️ **MongoDB credentials are stored in plaintext** - Required for automation but ensure:
  - MongoDB has authentication enabled
  - Network access is restricted (firewall/VPC)
  - Connection uses TLS/SSL in production
  - Database encryption at rest is enabled
  - Access logs are monitored
⚠️ Rotate credentials regularly
⚠️ Use environment-specific configurations
⚠️ Limit worker access to read-only on Account and Brand collections

## License

Internal use only - Casepulse project

