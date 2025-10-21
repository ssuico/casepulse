# ⚠️ IMPORTANT: Credential Storage Issue

## Current Implementation Status

✅ **Working**: Account management UI, MongoDB storage, secure hashing  
⚠️ **Issue**: Credentials are **hashed** and cannot be retrieved for Puppeteer worker

## The Problem

Currently, the Account model uses **bcrypt hashing** for passwords and 2FA keys. This means:

- ✅ Credentials are stored securely (one-way hash)
- ❌ Credentials **cannot be retrieved** in plain text
- ❌ Puppeteer worker **cannot use** these credentials to log in

**Hashing is one-way** - you can verify a password matches, but you can't decrypt it back to the original value.

## The Solution: Use Encryption Instead

To make credentials usable by the Puppeteer worker, you need to **encrypt** (not hash) the credentials.

### Implementation Steps

#### 1. Install crypto library

```bash
npm install crypto-js
```

#### 2. Create encryption utility

Create `src/lib/encryption.ts`:

```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-super-secret-key-change-this-in-production';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

#### 3. Update Account Model

Replace the bcrypt pre-save hooks in `src/models/Account.ts`:

```typescript
import { encrypt } from '@/lib/encryption';

// REMOVE the bcrypt hashing pre-save hooks
// REPLACE with encryption:

AccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = encrypt(this.password);
  next();
});

AccountSchema.pre('save', async function (next) {
  if (!this.isModified('twoFAKey')) {
    return next();
  }
  this.twoFAKey = encrypt(this.twoFAKey);
  next();
});
```

#### 4. Create Worker API Endpoint

Create `src/app/api/accounts/[id]/credentials/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import { decrypt } from '@/lib/encryption';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const account = await Account.findById(id).select('+password +twoFAKey');

    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Decrypt credentials for worker
    return NextResponse.json({
      success: true,
      data: {
        _id: account._id,
        accountName: account.accountName,
        username: account.username,
        password: decrypt(account.password),
        twoFAKey: decrypt(account.twoFAKey),
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch credentials',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

#### 5. Update Worker to Fetch Credentials

In `worker/seller-central-login.js`, add a function to fetch credentials:

```javascript
async function fetchAccountCredentials(accountId) {
  const response = await fetch(`http://localhost:3000/api/accounts/${accountId}/credentials`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error('Failed to fetch account credentials');
  }
  
  return data.data;
}

// In main(), replace CONFIG with:
const accountId = process.env.ACCOUNT_ID; // Pass account ID
const account = await fetchAccountCredentials(accountId);

const CONFIG = {
  username: account.username,
  password: account.password,
  twoFAKey: account.twoFAKey,
  // ... rest of config
};
```

#### 6. Add Environment Variable

Add to `.env`:

```env
ENCRYPTION_KEY=your-super-secret-32-character-key-here-change-this
```

**Important**: Use a strong, random key in production. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Alternative: Store Unhashed (NOT RECOMMENDED)

If you're in a development environment and don't care about security, you can simply remove the pre-save hooks that hash the credentials. But **DO NOT do this in production**.

## Security Considerations

### Encryption vs Hashing

| Method | Use Case | Can Decrypt? | Good For |
|--------|----------|--------------|----------|
| **Hashing** (bcrypt) | Password verification | ❌ No | User login passwords |
| **Encryption** (AES) | Data storage | ✅ Yes (with key) | API keys, credentials |

### Best Practices

1. ✅ Store encryption key in environment variables
2. ✅ Use a strong, random encryption key (32+ characters)
3. ✅ Rotate encryption key periodically
4. ✅ Use HTTPS in production
5. ✅ Add authentication to credential API endpoints
6. ✅ Implement rate limiting
7. ✅ Log credential access for auditing
8. ✅ Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault)

## Quick Fix Summary

**Current State**: 
- Passwords are hashed ❌ Can't be used by worker

**Required Changes**:
1. Install `crypto-js`
2. Create `src/lib/encryption.ts`
3. Update `src/models/Account.ts` to use encryption
4. Create credentials API endpoint
5. Update worker to fetch credentials
6. Add `ENCRYPTION_KEY` to environment

**After Fix**:
- Passwords are encrypted ✅ Can be decrypted for worker use
- Still secure (encryption key required)
- Worker can fetch and use credentials

---

**Status**: ⚠️ Implementation needed before worker can use stored credentials

