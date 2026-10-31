import mongoose, { Schema, type Model } from 'mongoose';
import type { PublicationStatus } from '@/types/portfolio';

export interface AchievementDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  title: string;
  issuer: string;
  dateDisplay: string;
  description: string;
  certificateImageUrl?: string;
  certificatePublicId?: string;
  verificationUrl?: string;
  displayOrder: number;
  status: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<AchievementDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    dateDisplay: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    certificateImageUrl: { type: String, trim: true },
    certificatePublicId: { type: String, trim: true },
    verificationUrl: { type: String, trim: true },
    displayOrder: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  { timestamps: true }
);

achievementSchema.index({ status: 1, displayOrder: 1 });

export const AchievementModel: Model<AchievementDocument> =
  (mongoose.models.Achievement as Model<AchievementDocument>) ||
  mongoose.model<AchievementDocument>('Achievement', achievementSchema);
