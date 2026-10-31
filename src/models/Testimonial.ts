import mongoose, { Schema, type Model } from 'mongoose';
import type { PublicationStatus } from '@/types/portfolio';

export interface TestimonialDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  clientName: string;
  company?: string;
  designation?: string;
  avatarUrl: string;
  avatarPublicId?: string;
  avatarAlt: string;
  text: string;
  dateDisplay: string;
  dateISO: string;
  displayOrder: number;
  status: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<TestimonialDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    clientName: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    avatarUrl: { type: String, required: true, trim: true },
    avatarPublicId: { type: String, trim: true },
    avatarAlt: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    dateDisplay: { type: String, required: true, trim: true },
    dateISO: { type: String, required: true, trim: true },
    displayOrder: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  { timestamps: true }
);

testimonialSchema.index({ status: 1, displayOrder: 1 });

export const TestimonialModel: Model<TestimonialDocument> =
  (mongoose.models.Testimonial as Model<TestimonialDocument>) ||
  mongoose.model<TestimonialDocument>('Testimonial', testimonialSchema);
