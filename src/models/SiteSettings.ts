import mongoose, { Schema, type Model } from 'mongoose';

export interface SiteSettingsDocument {
  _id: mongoose.Types.ObjectId;
  singletonKey: string;
  siteTitle: string;
  siteDescription: string;
  faviconUrl: string;
  faviconPublicId?: string;
  defaultTheme: 'dark' | 'light';
  enableThemeToggle: boolean;
  enableThreeD: boolean;
  mapEmbedUrl: string;
  contactFormTitle: string;
  contactSubmitLabel: string;
  googleScriptWebhookUrl?: string;
  seoKeywords: string[];
  ogImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<SiteSettingsDocument>(
  {
    singletonKey: {
      type: String,
      required: true,
      default: 'default',
      unique: true,
    },
    siteTitle: { type: String, required: true, trim: true },
    siteDescription: { type: String, required: true, trim: true },
    faviconUrl: { type: String, required: true, trim: true },
    faviconPublicId: { type: String, trim: true },
    defaultTheme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    enableThemeToggle: { type: Boolean, default: true },
    enableThreeD: { type: Boolean, default: true },
    mapEmbedUrl: { type: String, required: true, trim: true },
    contactFormTitle: {
      type: String,
      required: true,
      trim: true,
      default: 'Contact Form',
    },
    contactSubmitLabel: {
      type: String,
      required: true,
      trim: true,
      default: 'Send Message',
    },
    googleScriptWebhookUrl: { type: String, trim: true, default: '' },
    seoKeywords: { type: [String], default: [] },
    ogImageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export const SiteSettingsModel: Model<SiteSettingsDocument> =
  (mongoose.models.SiteSettings as Model<SiteSettingsDocument>) ||
  mongoose.model<SiteSettingsDocument>('SiteSettings', siteSettingsSchema);
