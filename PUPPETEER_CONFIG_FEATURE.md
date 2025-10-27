# Puppeteer Configuration Feature

## Overview

A new **Puppeteer Configuration** page has been added to CasePulse that allows you to manage global Puppeteer worker settings through a user-friendly web interface. These settings are stored in MongoDB and automatically applied to all worker instances.

## What Was Created

### 1. Database Model
**File:** `src/models/PuppeteerConfig.ts`

- MongoDB schema for storing Puppeteer configuration
- Fields: `headless`, `timeout`, `sellerCentralUrl`
- Includes timestamps for tracking changes

### 2. API Routes
**File:** `src/app/api/puppeteer-config/route.ts`

- `GET /api/puppeteer-config` - Fetch current configuration
- `PUT /api/puppeteer-config` - Update configuration
- Auto-creates default config if none exists
- Input validation for all fields

### 3. Configuration Page
**File:** `src/app/puppeteer-config/page.tsx`

Modern, responsive UI with:
- **Headless Mode Toggle** - Enable/disable browser visibility
- **Timeout Input** - Set worker timeout in milliseconds (with conversion display)
- **Seller Central URL Input** - Configure initial navigation URL
- Real-time save/reset functionality
- Success/error message notifications
- Info card explaining each setting
- Last updated timestamp

### 4. Navigation Update
**File:** `src/components/sidebar.tsx`

- Added new "Settings" section to sidebar
- "Puppeteer Configuration" menu item with Settings icon
- Follows existing design patterns

### 5. Worker Integration
**Files:** 
- `worker/models/PuppeteerConfig.js` - Worker-side MongoDB model
- `worker/seller-central-login.js` - Updated to fetch config from MongoDB

Worker now:
- Fetches configuration from MongoDB on startup
- Falls back to defaults if MongoDB is unavailable
- Allows environment variables to override MongoDB settings

## Configuration Fields

### Headless Mode
- **Type:** Boolean
- **Default:** `true`
- **Description:** When enabled, browser runs without visible window (ideal for production). Disable for debugging.

### Timeout
- **Type:** Number (milliseconds)
- **Default:** `180000` (3 minutes)
- **Range:** 30,000ms - 600,000ms
- **Description:** Maximum time the worker will run before timing out

### Seller Central URL
- **Type:** String
- **Default:** `https://sellercentral.amazon.com/home`
- **Description:** Initial URL the worker navigates to before login

## How to Use

### Via Web Interface

1. **Navigate to Configuration Page**
   - Click "Puppeteer Configuration" in the sidebar under "Settings"
   - Or visit `/puppeteer-config`

2. **Adjust Settings**
   - Toggle headless mode with the buttons
   - Enter timeout value (automatically shows seconds/minutes)
   - Update Seller Central URL if needed

3. **Save Changes**
   - Click "Save Configuration"
   - Changes take effect immediately for new worker executions
   - Success message confirms save

4. **Reset Changes**
   - Click "Reset" to revert to last saved values

### Configuration Priority

The worker applies settings in this order:

1. **Environment Variables** (highest priority)
   ```bash
   HEADLESS=false TIMEOUT_MS=120000 npm start
   ```

2. **MongoDB Configuration**
   - Settings from Puppeteer Configuration page

3. **Hardcoded Defaults** (lowest priority)
   - Used if MongoDB is unavailable

## MongoDB Structure

### Collection: `puppeteerconfigs`

```javascript
{
  _id: ObjectId("..."),
  headless: true,
  timeout: 180000,
  sellerCentralUrl: "https://sellercentral.amazon.com/home",
  createdAt: ISODate("2025-10-27T..."),
  updatedAt: ISODate("2025-10-27T...")
}
```

**Note:** Only one document should exist in this collection (singleton pattern)

## Worker Behavior

### Startup Sequence

1. Load environment variables from `.env`
2. Connect to MongoDB
3. Fetch Puppeteer configuration from `puppeteerconfigs` collection
4. Apply configuration (with env var overrides)
5. Launch Puppeteer browser with configured settings

### Example Output

```
⚙️ Loading configuration...
✅ MongoDB connected successfully
⚙️ Fetching Puppeteer configuration from MongoDB...
✅ Puppeteer config loaded: headless=true, timeout=180000ms
🚀 Launching browser...
   Headless mode: true
```

## Benefits

✅ **No Code Changes** - Update settings without modifying files
✅ **Centralized Management** - Single source of truth for all workers
✅ **User-Friendly** - Non-technical users can adjust settings
✅ **Audit Trail** - MongoDB timestamps track all changes
✅ **Flexible Override** - Environment variables for special cases
✅ **Safe Defaults** - Automatic fallback if config unavailable

## Example Scenarios

### Scenario 1: Debug a Login Issue
1. Navigate to `/puppeteer-config`
2. Click "Disable (Debug)" for Headless Mode
3. Click "Save Configuration"
4. Run worker - browser will be visible
5. After debugging, re-enable headless mode

### Scenario 2: Increase Timeout for Slow Networks
1. Navigate to `/puppeteer-config`
2. Change timeout from 180000 to 300000 (5 minutes)
3. Click "Save Configuration"
4. All future worker runs will use new timeout

### Scenario 3: One-Time Override
```bash
# Temporarily override headless for single run (doesn't affect DB)
HEADLESS=false node worker/seller-central-login.js
```

## UI Features

### Visual Design
- Clean, modern card-based layout
- Dark mode support
- Responsive design (works on all screen sizes)
- Consistent with CasePulse design system

### User Experience
- Real-time validation
- Loading states during save
- Success/error notifications (auto-dismiss after 3s)
- Helpful tooltips and descriptions
- Time conversion display (ms → seconds/minutes)
- Last updated timestamp

### Accessibility
- Proper form labels
- Keyboard navigation support
- Clear button states
- Descriptive error messages

## Testing Checklist

- [ ] Navigate to `/puppeteer-config` page loads
- [ ] Toggle headless mode (Enable/Disable buttons work)
- [ ] Change timeout value (validation works)
- [ ] Update Seller Central URL
- [ ] Click "Save Configuration" (success message appears)
- [ ] Click "Reset" (values revert)
- [ ] Run worker with new config (settings applied)
- [ ] Override with env vars (env vars take precedence)
- [ ] Check MongoDB (document created/updated)

## Troubleshooting

### Config not applying to worker
- Verify MongoDB connection in worker logs
- Check worker output for "Puppeteer config loaded" message
- Ensure no environment variables are overriding settings

### Can't save configuration
- Check browser console for errors
- Verify MongoDB is running and accessible
- Check API route logs for validation errors

### Page shows loading forever
- Check MongoDB connection
- Verify API route is accessible at `/api/puppeteer-config`
- Check browser network tab for failed requests

## Future Enhancements

Potential improvements for future versions:

- [ ] **Per-Account Configuration** - Override settings for specific accounts
- [ ] **Per-Brand Configuration** - Override settings for specific brands
- [ ] **Configuration History** - Track changes over time
- [ ] **Configuration Presets** - Save/load common configurations
- [ ] **Browser Options** - Add more Puppeteer launch options
- [ ] **Scheduling** - Time-based configuration switching
- [ ] **Notifications** - Alert when config changes

## Related Files

### Frontend
- `src/models/PuppeteerConfig.ts` - TypeScript model
- `src/app/api/puppeteer-config/route.ts` - API endpoints
- `src/app/puppeteer-config/page.tsx` - Configuration page
- `src/components/sidebar.tsx` - Navigation (updated)

### Worker
- `worker/models/PuppeteerConfig.js` - JavaScript model
- `worker/seller-central-login.js` - Worker (updated)

### Documentation
- `MONGODB_WORKER_INTEGRATION.md` - Overall integration docs (updated)
- `PUPPETEER_CONFIG_FEATURE.md` - This file

---

**Created:** October 27, 2025
**Status:** ✅ Complete and Ready for Use

