import mongoose from 'mongoose';

const { Schema } = mongoose;

const BrandSchema = new Schema(
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
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);

export default Brand;

