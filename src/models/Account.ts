import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAccount extends Document {
  accountName: string;
  username: string;
  password: string;
  twoFAKey: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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

// Hash password before saving
AccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Hash 2FA key before saving
AccountSchema.pre('save', async function (next) {
  if (!this.isModified('twoFAKey')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.twoFAKey = await bcrypt.hash(this.twoFAKey, salt);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Method to compare password
AccountSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Prevent model recompilation in development
const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

export default Account;

