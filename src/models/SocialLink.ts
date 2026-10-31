import mongoose, { Schema, type Model } from 'mongoose';
import type { IonIconName } from '@/types/portfolio';

export interface SocialLinkDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  platform: string;
  url: string;
  iconName: IonIconName;
  displayOrder: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const socialLinkSchema = new Schema<SocialLinkDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    iconName: { type: String, required: true, trim: true },
    displayOrder: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

socialLinkSchema.index({ visible: 1, displayOrder: 1 });

export const SocialLinkModel: Model<SocialLinkDocument> =
  (mongoose.models.SocialLink as Model<SocialLinkDocument>) ||
  mongoose.model<SocialLinkDocument>('SocialLink', socialLinkSchema);
