# Worker Trigger Feature

This feature allows you to trigger the Seller Central login worker for a specific brand directly from the Brands & Accounts table.

## How It Works

### 1. UI Button
- A new **green Play button** (▶️) has been added to the Actions column in the brands table
- When clicked, it triggers the Seller Central login worker for that specific brand
- The button shows a loading spinner while the worker is being started
- A success/error alert is displayed after the worker starts

### 2. API Endpoint
**Endpoint:** `POST /api/brands/[id]/run-worker`

This endpoint:
- Accepts the brand ID as a parameter
- Spawns the worker process with the brand ID as an environment variable
- Runs the worker in the background (detached process)
- Returns immediately with a success message

### 3. Worker Process
The worker script (`worker/seller-central-login.js`):
- Reads the brand ID from the `BRAND_ID` environment variable
- Fetches the brand and its associated account credentials from MongoDB
- Performs the login automation with Puppeteer
- Opens the brand's Seller Central page in the browser

## Usage

1. Navigate to the **Brands & Accounts** page
2. Find the brand you want to login to
3. Click the **green Play button** (▶️) in the Actions column
4. Wait for the success message
5. The browser will open automatically and navigate to the brand's Seller Central page

## Requirements

- The brand must have an associated account with valid credentials (username, password, 2FA key)
- The Puppeteer configuration must be set up (see Puppeteer Configuration page)
- MongoDB must be accessible
- Node.js must be installed on the server

## Technical Details

### Process Flow
1. User clicks Play button → UI state updates (loading)
2. Frontend sends POST request to `/api/brands/[id]/run-worker`
3. API spawns worker process with `BRAND_ID` environment variable (this is just the ID, not credentials!)
4. Worker process runs independently in the background
5. API returns success response → UI shows alert
6. Worker reads BRAND_ID and uses it to fetch brand + account data from MongoDB
7. Worker retrieves credentials (username, password, 2FA key) from the database
8. Worker launches Puppeteer browser and performs login
9. Browser stays open for user interaction

**Key Point:** The `BRAND_ID` is just an identifier (like `"507f1f77bcf86cd799439011"`). The actual credentials are securely fetched from MongoDB, never passed through environment variables or the API.

### Security Notes
- The worker runs on the server where the Next.js app is hosted
- Credentials are fetched from MongoDB, not exposed in the API
- The browser process is detached and runs independently
- The API doesn't wait for the worker to complete (fire and forget)

## Troubleshooting

### Worker doesn't start
- Check that the `worker` folder exists in the project root
- Verify that `worker/seller-central-login.js` is present
- Check MongoDB connection string in worker's `.env` file

### Browser doesn't open
- Check Puppeteer configuration (headless mode setting)
- Verify that Chrome/Chromium is installed on the server
- Check worker logs for errors

### Login fails
- Verify account credentials are correct in the database
- Check that 2FA key is valid
- Ensure the account isn't locked or requires manual intervention

## Future Enhancements

Potential improvements:
- Real-time worker status updates via WebSockets
- Worker execution history/logs in the UI
- Ability to cancel/stop running workers
- Queue system for multiple concurrent worker requests
- Worker scheduling (cron jobs)

