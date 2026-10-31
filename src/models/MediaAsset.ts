import mongoose, { Schema, type Model } from 'mongoose';

export interface MediaAssetDocument {
  _id: mongoose.Types.ObjectId;
  publicId: string;
  url: string;
  secureUrl: string;
  folder: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  altText: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<MediaAssetDocument>(
  {
    publicId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    url: { type: String, required: true, trim: true },
    secureUrl: { type: String, required: true, trim: true },
    folder: {
      type: String,
      required: true,
      trim: true,
      default: 'tamjid-portfolio',
    },
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw'],
      default: 'image',
    },
    format: { type: String, required: true, trim: true },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number, required: true, default: 0 },
    altText: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ folder: 1, createdAt: -1 });

export const MediaAssetModel: Model<MediaAssetDocument> =
  (mongoose.models.MediaAsset as Model<MediaAssetDocument>) ||
  mongoose.model<MediaAssetDocument>('MediaAsset', mediaAssetSchema);
