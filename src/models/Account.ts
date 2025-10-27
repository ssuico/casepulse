import mongoose, { Schema, Document, Model } from 'mongoose';
import { encrypt, isEncrypted } from '@/lib/crypto';

export interface IAccount extends Document {
  accountName: string;
  username: string;
  password: string;
  twoFAKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },
    twoFAKey: {
      type: String,
      required: [true, '2FA Key is required'],
      select: false, // Don't return 2FA key by default
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password and 2FA key before saving
AccountSchema.pre('save', async function (next) {
  try {
    // Only encrypt if the field was modified and is not already encrypted
    if (this.isModified('password') && !isEncrypted(this.password)) {
      this.password = encrypt(this.password);
    }
    
    if (this.isModified('twoFAKey') && !isEncrypted(this.twoFAKey)) {
      this.twoFAKey = encrypt(this.twoFAKey);
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Encrypt password and 2FA key before update
AccountSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate() as any;
    
    if (update.password && !isEncrypted(update.password)) {
      update.password = encrypt(update.password);
    }
    
    if (update.twoFAKey && !isEncrypted(update.twoFAKey)) {
      update.twoFAKey = encrypt(update.twoFAKey);
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// NOTE: Credentials are stored ENCRYPTED in MongoDB for security
// The automation worker will decrypt them when needed
// Ensure ENCRYPTION_KEY is properly secured in environment variables

// Prevent model recompilation in development
const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

export default Account;

