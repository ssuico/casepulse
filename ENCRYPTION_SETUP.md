# Account Credentials Encryption

This document explains how the CasePulse application encrypts Amazon Seller Central account credentials for secure storage while maintaining automation capability.

## Overview

**Problem**: The Puppeteer worker needs actual passwords to log into Amazon Seller Central, but storing plaintext passwords in MongoDB is insecure.

**Solution**: Use AES-256-GCM encryption to store credentials securely in MongoDB. The worker decrypts them only when needed.

## How It Works

### Encryption Flow
```
User creates account → Password typed in UI
    ↓
Mongoose pre-save hook encrypts password using AES-256-GCM
    ↓
Encrypted string stored in MongoDB
Format: salt:iv:tag:encryptedData
```

### Decryption Flow
```
Worker triggered from UI
    ↓
Worker fetches encrypted credentials from MongoDB
    ↓
Worker decrypts using ENCRYPTION_KEY
    ↓
Worker types plaintext password into Amazon login
```

## Security Features

### AES-256-GCM Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **Authentication**: Built-in authentication tag prevents tampering
- **Unique IVs**: Each encryption uses a random IV
- **Key Derivation**: PBKDF2 with 100,000 iterations

### Protection Against
- ✅ Database breaches (credentials are encrypted)
- ✅ Data tampering (authentication tag verification)
- ✅ Rainbow table attacks (unique salt per encryption)
- ✅ Brute force attacks (strong 256-bit encryption)

## Setup Instructions

### 1. Generate Encryption Key

```bash
node scripts/generate-encryption-key.js
```

This will output a secure 256-bit random key.

### 2. Add to Environment Variables

**Main App (.env)**:
```env
ENCRYPTION_KEY=your_generated_key_here
```

**Worker (worker/.env)**:
```env
ENCRYPTION_KEY=your_generated_key_here
```

⚠️ **IMPORTANT**: Use the SAME key in both locations!

### 3. Migrate Existing Accounts (If Any)

If you have existing accounts with plaintext credentials:

```bash
node scripts/encrypt-existing-accounts.js
```

This will encrypt all existing plaintext credentials.

### 4. Verify Setup

1. Create a new test account through the UI
2. Check MongoDB - password should look like: `a1b2c3:d4e5f6:g7h8i9:j0k1l2...`
3. Trigger worker for a brand - it should decrypt and login successfully

## Technical Details

### Encryption Format

Encrypted credentials are stored in this format:
```
salt:iv:tag:encryptedData
```

Each component is hex-encoded:
- **salt** (128 chars): Random salt for key derivation
- **iv** (32 chars): Initialization vector
- **tag** (32 chars): Authentication tag
- **encryptedData** (variable): The encrypted password/2FA key

### Code Files

**Encryption/Decryption**:
- `src/lib/crypto.ts` - Main app crypto utilities
- `worker/lib/crypto.js` - Worker crypto utilities

**Model Hooks**:
- `src/models/Account.ts` - Auto-encrypts on save/update

**Worker Decryption**:
- `worker/seller-central-login.js` - Decrypts when fetching credentials

## Security Best Practices

### Key Management
- ⚠️ **Never** commit `ENCRYPTION_KEY` to version control
- ⚠️ Store backup of key in secure password manager
- ⚠️ Use different keys for development/production
- ⚠️ Rotate key periodically (requires re-encryption)

### MongoDB Security
- ✅ Enable MongoDB authentication
- ✅ Use TLS/SSL for connections
- ✅ Enable encryption at rest
- ✅ Restrict network access (firewall/VPC)
- ✅ Monitor access logs

### Application Security
- ✅ Use HTTPS for all connections
- ✅ Restrict API endpoint access
- ✅ Log decryption events
- ✅ Implement rate limiting

## Troubleshooting

### "ENCRYPTION_KEY is not set" Error
**Solution**: Add `ENCRYPTION_KEY` to your `.env` file

### "ENCRYPTION_KEY must be at least 32 characters" Error
**Solution**: Generate a new key using the generator script

### "Failed to decrypt data" Error
**Causes**:
1. Wrong encryption key being used
2. Corrupted encrypted data
3. Different keys in app and worker

**Solution**: Verify both `.env` files have the SAME key

### Worker Can't Login After Encryption
**Check**:
1. `ENCRYPTION_KEY` is set in `worker/.env`
2. Key matches the one in main app `.env`
3. Run test decryption:
   ```javascript
   const { decrypt } = require('./worker/lib/crypto.js');
   console.log(decrypt(encryptedPassword));
   ```

### Need to Change Encryption Key
⚠️ **WARNING**: Changing the key will make existing encrypted data unreadable!

**Process**:
1. Export all accounts with old key (decrypt and save)
2. Change `ENCRYPTION_KEY` in both `.env` files
3. Re-import accounts (will encrypt with new key)

## Comparison: Hashing vs Encryption

### Hashing (Used for User Passwords)
```
Purpose: Verify passwords without storing them
Direction: One-way only
Example: bcrypt for CasePulse user accounts
Recovery: Impossible to get original password
```

### Encryption (Used for Account Credentials)
```
Purpose: Store passwords securely but retrieve them later
Direction: Two-way (encrypt and decrypt)
Example: AES-256-GCM for Amazon Seller Central credentials
Recovery: Possible with correct encryption key
```

## FAQs

**Q: Why not use hashing for account credentials?**  
A: Hashing is one-way - you can't decrypt it. The worker needs the actual password to type into Amazon's login form.

**Q: Is this secure enough?**  
A: Yes. AES-256-GCM is military-grade encryption used by governments and banks. As long as you keep `ENCRYPTION_KEY` secure, your credentials are safe.

**Q: What if someone steals my MongoDB backup?**  
A: Without the `ENCRYPTION_KEY`, the credentials are useless encrypted data. They cannot be decrypted.

**Q: What if someone steals my ENCRYPTION_KEY?**  
A: They could decrypt your credentials. Keep this key as secure as you would keep the passwords themselves. Use environment variables, never commit to code.

**Q: Can I use the same ENCRYPTION_KEY for multiple environments?**  
A: Not recommended. Use different keys for dev/staging/production for better security isolation.

## Support

If you encounter issues with encryption:
1. Check the troubleshooting section above
2. Verify your environment variables
3. Check MongoDB logs for errors
4. Review worker logs for decryption issues

---

**Remember**: The encryption is only as secure as you keep the `ENCRYPTION_KEY`! 🔐

