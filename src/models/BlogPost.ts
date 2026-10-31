import mongoose, { Schema, type Model } from 'mongoose';
import type { PublicationStatus } from '@/types/portfolio';

export interface BlogPostDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  title: string;
  slug: string;
  category: string;
  publishedDateDisplay: string;
  publishedDateISO: string;
  excerpt: string;
  content?: string;
  bannerUrl: string;
  bannerPublicId?: string;
  bannerAlt: string;
  externalUrl: string;
  displayOrder: number;
  status: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<BlogPostDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    category: { type: String, required: true, trim: true },
    publishedDateDisplay: { type: String, required: true, trim: true },
    publishedDateISO: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    bannerUrl: { type: String, required: true, trim: true },
    bannerPublicId: { type: String, trim: true },
    bannerAlt: { type: String, required: true, trim: true },
    externalUrl: { type: String, required: true, trim: true, default: '#' },
    displayOrder: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  { timestamps: true }
);

blogPostSchema.index({ status: 1, displayOrder: 1 });

export const BlogPostModel: Model<BlogPostDocument> =
  (mongoose.models.BlogPost as Model<BlogPostDocument>) ||
  mongoose.model<BlogPostDocument>('BlogPost', blogPostSchema);
