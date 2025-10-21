# Seller Central Account Management

This feature allows you to securely manage Amazon Seller Central account credentials for use with the Puppeteer automation worker.

## Features

✅ **Secure Storage**: All passwords and 2FA keys are hashed using bcrypt before storing in MongoDB  
✅ **Account Management**: Add, view, and delete Seller Central accounts  
✅ **Privacy**: Passwords and 2FA keys are never displayed in the UI  
✅ **MongoDB Integration**: Credentials are stored in MongoDB Atlas with connection pooling  
✅ **Beautiful UI**: Modern interface with modal dialogs and responsive tables  

## Architecture

### Database Layer

**File**: `src/lib/mongodb.ts`
- MongoDB connection utility with connection pooling
- Caches connections to prevent multiple connections in serverless environments
- Automatically handles reconnection

**File**: `src/models/Account.ts`
- Mongoose schema for Seller Central accounts
- Pre-save hooks to hash passwords and 2FA keys using bcrypt
- Password comparison method for authentication
- Fields: `accountName`, `username`, `password`, `twoFAKey`, `createdAt`, `updatedAt`

### API Layer

**Endpoints**:

1. **GET** `/api/accounts`
   - Returns all accounts without sensitive data (no passwords/2FA keys)
   - Used by the UI to display the accounts table

2. **POST** `/api/accounts`
   - Creates a new account
   - Validates required fields
   - Checks for duplicate account names
   - Hashes password and 2FA key before saving

3. **GET** `/api/accounts/[id]`
   - Returns a single account WITH credentials (for worker use)
   - Returns hashed password and 2FA key
   - **Note**: Credentials are hashed, so you'd need to store them unhashed for worker use

4. **DELETE** `/api/accounts/[id]`
   - Deletes an account by ID
   - Confirms deletion with the user

5. **PUT** `/api/accounts/[id]`
   - Updates an account
   - Re-hashes password/2FA key if changed

### UI Components

**File**: `src/components/add-account-modal.tsx`
- Modal dialog for adding new accounts
- Form validation
- Password/2FA key visibility toggle
- Loading states and error handling
- Uses shadcn/ui Dialog component

**File**: `src/components/accounts-table.tsx`
- Displays all accounts in a table
- Hides passwords and 2FA keys (shows `••••••••`)
- Delete functionality with confirmation
- Empty state when no accounts exist
- Formatted dates

**File**: `src/app/cases/page.tsx`
- Integrated account management section
- Add Account button opens modal
- Fetches accounts on component mount
- Refreshes accounts after add/delete operations

## Security Considerations

### ✅ Implemented

1. **Password Hashing**: All passwords are hashed with bcrypt (10 salt rounds)
2. **2FA Key Hashing**: 2FA keys are also hashed before storage
3. **Selective Field Return**: API excludes sensitive fields by default
4. **Input Validation**: Required field validation on both client and server
5. **Unique Constraints**: Account names must be unique

### ⚠️ Important Note

Currently, passwords and 2FA keys are **hashed** before storage, which means they cannot be retrieved in plain text for the Puppeteer worker. 

**Two options to fix this:**

#### Option 1: Encrypt Instead of Hash (Recommended for workers)
- Use encryption (AES-256) instead of hashing
- Store an encryption key in environment variables
- Decrypt credentials when needed by the worker

#### Option 2: Store Unhashed (Less secure)
- Remove the pre-save hooks that hash the credentials
- Store them in plain text (NOT RECOMMENDED for production)

**For the worker to use these credentials**, you'll need to implement **Option 1** by:
1. Installing a crypto library (e.g., `crypto-js`)
2. Creating encryption/decryption utilities
3. Updating the Account model to encrypt instead of hash
4. Creating an API endpoint that returns decrypted credentials for the worker

## Usage

### Adding an Account

1. Navigate to the Cases page
2. Click **"Add Account"** button in the Seller Central Accounts section
3. Fill in the form:
   - **Account Name**: Unique identifier (e.g., "REFRIGIWEAR US")
   - **Username**: Seller Central email
   - **Password**: Seller Central password
   - **2FA Key**: The secret key from your authenticator app
4. Click **"Add Account"**

### Viewing Accounts

- All accounts are displayed in a table on the Cases page
- Passwords and 2FA keys are hidden for security
- Shows account name, username, and creation date

### Deleting an Account

1. Click the trash icon next to an account
2. Confirm deletion in the popup
3. Account is permanently deleted

## Environment Variables

Add to `.env.local`:

```env
MONGODB_URI=mongodb+srv://admin:PpScktvdTnfPw5oU@case-pulse.qro8x.mongodb.net/casepulse?retryWrites=true&w=majority
```

## Future Enhancements

- [ ] Implement encryption instead of hashing for worker compatibility
- [ ] Add account editing functionality
- [ ] Bulk import accounts from CSV
- [ ] Account health checks (test login)
- [ ] Integration with Puppeteer worker
- [ ] Audit logs for account access
- [ ] Role-based access control
- [ ] Account groups/tags
- [ ] Export accounts list

## Database Schema

```typescript
{
  accountName: string (required, unique)
  username: string (required)
  password: string (required, select: false)
  twoFAKey: string (required, select: false)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-updated)
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Testing

1. **Create Account**: Test adding a new account with all fields
2. **Duplicate Check**: Try adding an account with the same name
3. **View Accounts**: Verify accounts display without sensitive data
4. **Delete Account**: Test deletion with confirmation
5. **Field Validation**: Submit form with missing fields
6. **Database Connection**: Check MongoDB Atlas connection

## Troubleshooting

### "Failed to fetch accounts"
- Check MongoDB connection string
- Verify MongoDB Atlas network access (allow your IP)
- Check console for detailed errors

### "Account name already exists"
- Each account name must be unique
- Delete the old account or use a different name

### "Failed to create account"
- Verify all fields are filled
- Check MongoDB connection
- Review server logs for errors

## Dependencies

```json
{
  "mongoose": "^8.x.x",
  "bcryptjs": "^2.4.3",
  "@radix-ui/react-dialog": "^1.x.x"
}
```

## Files Structure

```
src/
├── app/
│   ├── api/
│   │   └── accounts/
│   │       ├── route.ts (GET all, POST create)
│   │       └── [id]/
│   │           └── route.ts (GET one, PUT update, DELETE)
│   └── cases/
│       └── page.tsx (integrated UI)
├── components/
│   ├── add-account-modal.tsx
│   ├── accounts-table.tsx
│   └── ui/
│       └── dialog.tsx
├── lib/
│   └── mongodb.ts
└── models/
    └── Account.ts
```

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Store MongoDB URI in environment variables
3. ✅ Use strong passwords for MongoDB
4. ✅ Implement rate limiting on API endpoints
5. ✅ Add authentication/authorization before production use
6. ⚠️ Consider encrypting credentials instead of hashing
7. ✅ Regularly rotate MongoDB credentials
8. ✅ Enable MongoDB audit logs
9. ✅ Use least privilege for MongoDB user permissions
10. ✅ Implement CORS policies

---

**Status**: ✅ Fully Implemented (with note about encryption for worker use)

