import mongoose, { Schema, type Model } from 'mongoose';

export interface ContactMessageDocument {
  _id: mongoose.Types.ObjectId;
  fullname: string;
  email: string;
  message: string;
  isRead: boolean;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, required: true, default: false },
    ipHash: { type: String, trim: true },
  },
  { timestamps: true }
);

contactMessageSchema.index({ isRead: 1, createdAt: -1 });

export const ContactMessageModel: Model<ContactMessageDocument> =
  (mongoose.models.ContactMessage as Model<ContactMessageDocument>) ||
  mongoose.model<ContactMessageDocument>(
    'ContactMessage',
    contactMessageSchema
  );
