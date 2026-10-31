import mongoose, { Schema, type Model } from 'mongoose';

export interface ClientLogoDocument {
  _id: mongoose.Types.ObjectId;
  seedKey?: string;
  name: string;
  logoUrl: string;
  logoPublicId?: string;
  logoAlt: string;
  websiteUrl: string;
  displayOrder: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clientLogoSchema = new Schema<ClientLogoDocument>(
  {
    seedKey: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true, trim: true },
    logoPublicId: { type: String, trim: true },
    logoAlt: { type: String, required: true, trim: true },
    websiteUrl: { type: String, required: true, trim: true, default: '#' },
    displayOrder: { type: Number, required: true, default: 0 },
    visible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

clientLogoSchema.index({ visible: 1, displayOrder: 1 });

export const ClientLogoModel: Model<ClientLogoDocument> =
  (mongoose.models.ClientLogo as Model<ClientLogoDocument>) ||
  mongoose.model<ClientLogoDocument>('ClientLogo', clientLogoSchema);
