import mongoose from 'mongoose';

const { Schema } = mongoose;

const PuppeteerConfigSchema = new Schema(
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

// Prevent model recompilation in development
const PuppeteerConfig = mongoose.models.PuppeteerConfig || mongoose.model('PuppeteerConfig', PuppeteerConfigSchema);

export default PuppeteerConfig;

