import mongoose, { Schema, type Model } from 'mongoose';
import type { PortfolioPageSlug } from '@/types/portfolio';

export interface NavigationItemDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  label: string;
  slug: PortfolioPageSlug;
  displayOrder: number;
  visible: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const navigationItemSchema = new Schema<NavigationItemDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    label: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      enum: ['about', 'resume', 'portfolio', 'blog', 'contact'],
      unique: true,
    },
    displayOrder: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
    isDefault: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

navigationItemSchema.index({ visible: 1, displayOrder: 1 });

export const NavigationItemModel: Model<NavigationItemDocument> =
  (mongoose.models.NavigationItem as Model<NavigationItemDocument>) ||
  mongoose.model<NavigationItemDocument>(
    'NavigationItem',
    navigationItemSchema
  );
