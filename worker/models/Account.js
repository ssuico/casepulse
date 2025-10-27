import mongoose from 'mongoose';

const { Schema } = mongoose;

const AccountSchema = new Schema(
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

// Prevent model recompilation in development
const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);

export default Account;

