import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPuppeteerConfig extends Document {
  headless: boolean;
  timeout: number;
  sellerCentralUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const PuppeteerConfigSchema = new Schema<IPuppeteerConfig>(
  {
    headless: {
      type: Boolean,
      default: true,
      required: true,
    },
    timeout: {
      type: Number,
      default: 180000, // 3 minutes
      required: true,
    },
    sellerCentralUrl: {
      type: String,
      default: 'https://sellercentral.amazon.com/home',
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one config document exists
PuppeteerConfigSchema.index({}, { unique: true });

// Prevent model recompilation in development
const PuppeteerConfig: Model<IPuppeteerConfig> =
  mongoose.models.PuppeteerConfig || mongoose.model<IPuppeteerConfig>('PuppeteerConfig', PuppeteerConfigSchema);

export default PuppeteerConfig;

