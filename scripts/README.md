# Database Migration Scripts

## Hash Existing Passwords

If you have existing users in your database with plain text passwords, run this migration script to hash them.

### Setup

1. Make sure you're in the project root directory
2. Set your MongoDB connection string as an environment variable:

```bash
# Windows (Command Prompt)
set MONGODB_URI=mongodb://your-connection-string

# Windows (PowerShell)
$env:MONGODB_URI="mongodb://your-connection-string"

# Linux/Mac
export MONGODB_URI=mongodb://your-connection-string
```

### Run the Migration

```bash
node scripts/hash-existing-passwords.js
```

### What it does

- ✅ Connects to your MongoDB database
- ✅ Finds all users
- ✅ Checks if each password is already hashed
- ✅ Hashes any plain text passwords using bcrypt
- ✅ Skips passwords that are already hashed
- ✅ Provides a summary of changes

### Safety

- The script is **safe to run multiple times** - it will skip passwords that are already hashed
- It uses the same bcrypt algorithm as your application (salt rounds: 10)
- No data is deleted, only passwords are updated

### After Migration

After running this script, all your users will have properly hashed passwords and you won't see plain text passwords in MongoDB anymore! 🎉

---

## Migrate Cookies Timestamp

If you have existing brands with cookies but no `cookiesUpdatedAt` timestamp (due to adding this field after initial setup), run this migration script to backfill the timestamps.

### Setup

1. Make sure you're in the project root directory
2. Set your MongoDB connection string as an environment variable:

```bash
# Windows (Command Prompt)
set MONGODB_URI=mongodb://your-connection-string

# Windows (PowerShell)
$env:MONGODB_URI="mongodb://your-connection-string"

# Linux/Mac
export MONGODB_URI=mongodb://your-connection-string
```

### Run the Migration

```bash
node scripts/migrate-cookies-timestamp.js
```

### What it does

- ✅ Connects to your MongoDB database
- ✅ Finds all brands that have cookies but no cookiesUpdatedAt timestamp
- ✅ Sets cookiesUpdatedAt to the brand's updatedAt timestamp
- ✅ Skips brands that already have the timestamp
- ✅ Provides a summary of changes

### Safety

- The script is **safe to run multiple times** - it will skip brands that already have the cookiesUpdatedAt field
- No data is deleted, only the timestamp field is added
- Uses the existing updatedAt timestamp as a reasonable default

### After Migration

After running this script, all your brands with cookies will have proper timestamps showing when cookies were last set! 🎉

---

## Generate Encryption Key

Generate a secure random encryption key for Account credentials encryption.

### Run the Generator

```bash
node scripts/generate-encryption-key.js
```

### What it does

- ✅ Generates a cryptographically secure 256-bit random key
- ✅ Displays the key for you to copy
- ✅ Provides setup instructions
- ✅ Warns about security best practices

### Setup Instructions

1. Run the script to generate a key
2. Copy the generated key
3. Add to your main `.env` file:
   ```env
   ENCRYPTION_KEY=your_generated_key_here
   ```
4. Add to your `worker/.env` file (SAME KEY):
   ```env
   ENCRYPTION_KEY=your_generated_key_here
   ```
5. **NEVER** commit this key to version control
6. Store a backup in a secure password manager

### Important Notes

⚠️ **Keep this key SECRET** - Anyone with this key can decrypt your credentials  
⚠️ **Do NOT lose this key** - You cannot decrypt data without it  
⚠️ **Use the SAME key** in both main app and worker  
⚠️ **Never change this key** after encrypting data (or you'll lose access to existing data)

---

## Encrypt Existing Accounts

If you have existing accounts with plaintext credentials in MongoDB, run this migration to encrypt them.

### Prerequisites

1. Generate and set `ENCRYPTION_KEY` in your `.env` file (see above)
2. Set your MongoDB connection string

### Run the Migration

```bash
# Make sure ENCRYPTION_KEY is set in .env
node scripts/encrypt-existing-accounts.js
```

### What it does

- ✅ Connects to your MongoDB database
- ✅ Finds all accounts in the collection
- ✅ Checks if passwords and 2FA keys are already encrypted
- ✅ Encrypts any plaintext credentials using AES-256-GCM
- ✅ Skips already encrypted credentials
- ✅ Provides a summary of changes

### Safety

- The script is **safe to run multiple times** - it will skip already encrypted credentials
- Uses industry-standard AES-256-GCM encryption
- No data is deleted, only passwords and 2FA keys are encrypted
- Encrypted data format: `salt:iv:tag:encryptedData`

### After Migration

After running this script:
- ✅ All account credentials are encrypted in MongoDB
- ✅ The worker will automatically decrypt them when needed
- ✅ Much more secure than storing plaintext

