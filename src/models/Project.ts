import mongoose, { Schema, type Model } from 'mongoose';
import type { PublicationStatus } from '@/types/portfolio';

export interface ProjectDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  title: string;
  slug: string;
  category: string;
  filterCategory: string;
  shortDescription?: string;
  fullDescription?: string;
  thumbnailUrl: string;
  thumbnailPublicId?: string;
  thumbnailAlt: string;
  gallery?: string[];
  technologies?: string[];
  liveUrl: string;
  githubUrl?: string;
  featured: boolean;
  displayOrder: number;
  status: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
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
    filterCategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: { type: String, trim: true },
    fullDescription: { type: String, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    thumbnailPublicId: { type: String, trim: true },
    thumbnailAlt: { type: String, required: true, trim: true },
    gallery: { type: [String], default: undefined },
    technologies: { type: [String], default: undefined },
    liveUrl: { type: String, required: true, trim: true, default: '#' },
    githubUrl: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, displayOrder: 1 });
projectSchema.index({ filterCategory: 1, status: 1, displayOrder: 1 });

export const ProjectModel: Model<ProjectDocument> =
  (mongoose.models.Project as Model<ProjectDocument>) ||
  mongoose.model<ProjectDocument>('Project', projectSchema);
