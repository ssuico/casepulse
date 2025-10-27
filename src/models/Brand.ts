import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
  brandName: string;
  sellerCentralAccountId: mongoose.Types.ObjectId;
  brandUrl: string;
  marketplace: 'US' | 'Canada' | 'Mexico';
  cookies?: string;
  cookiesUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    brandName: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    sellerCentralAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Seller Central Account is required'],
    },
    brandUrl: {
      type: String,
      required: [true, 'Brand URL is required'],
      trim: true,
    },
    marketplace: {
      type: String,
      enum: ['US', 'Canada', 'Mexico'],
      required: [true, 'Marketplace is required'],
      default: 'US',
    },
    cookies: {
      type: String,
      default: '',
    },
    cookiesUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;

