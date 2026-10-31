import mongoose, { Schema, type Model } from 'mongoose';

export interface EducationDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  institution: string;
  degree?: string;
  department?: string;
  dateRange: string;
  description: string;
  logoUrl?: string;
  logoPublicId?: string;
  displayOrder: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema<EducationDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    institution: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true },
    department: { type: String, trim: true },
    dateRange: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    logoUrl: { type: String, trim: true },
    logoPublicId: { type: String, trim: true },
    displayOrder: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

educationSchema.index({ visible: 1, displayOrder: 1 });

export const EducationModel: Model<EducationDocument> =
  (mongoose.models.Education as Model<EducationDocument>) ||
  mongoose.model<EducationDocument>('Education', educationSchema);
