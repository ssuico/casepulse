import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
  brandName: string;
  sellerCentralAccountId: mongoose.Types.ObjectId;
  brandUrl: string;
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
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;

