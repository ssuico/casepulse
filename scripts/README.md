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

