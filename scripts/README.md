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

