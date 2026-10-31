import mongoose, { Schema, type Model } from 'mongoose';

export interface ServiceDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  title: string;
  description: string;
  iconUrl: string;
  iconPublicId?: string;
  iconAlt: string;
  displayOrder: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<ServiceDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    iconUrl: { type: String, required: true, trim: true },
    iconPublicId: { type: String, trim: true },
    iconAlt: { type: String, required: true, trim: true },
    displayOrder: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ visible: 1, displayOrder: 1 });

export const ServiceModel: Model<ServiceDocument> =
  (mongoose.models.Service as Model<ServiceDocument>) ||
  mongoose.model<ServiceDocument>('Service', serviceSchema);
