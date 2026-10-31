import mongoose, { Schema, type Model } from 'mongoose';

export interface ExperienceDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  position: string;
  company?: string;
  employmentType?: string;
  location?: string;
  dateRange: string;
  isCurrent: boolean;
  description: string;
  responsibilities?: string[];
  technologies?: string[];
  logoUrl?: string;
  logoPublicId?: string;
  displayOrder: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<ExperienceDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    position: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    employmentType: { type: String, trim: true },
    location: { type: String, trim: true },
    dateRange: { type: String, trim: true, default: '' },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true, default: '' },
    responsibilities: { type: [String], default: undefined },
    technologies: { type: [String], default: undefined },
    logoUrl: { type: String, trim: true },
    logoPublicId: { type: String, trim: true },
    displayOrder: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

experienceSchema.index({ visible: 1, displayOrder: 1 });

export const ExperienceModel: Model<ExperienceDocument> =
  (mongoose.models.Experience as Model<ExperienceDocument>) ||
  mongoose.model<ExperienceDocument>('Experience', experienceSchema);
