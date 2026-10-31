import mongoose, { Schema, type Model } from 'mongoose';

export interface ProfileDocument {
  _id: mongoose.Types.ObjectId;
  singletonKey: string;
  fullName: string;
  professionalTitle: string;
  avatarUrl: string;
  avatarPublicId?: string;
  avatarAlt: string;
  email: string;
  phone: string;
  phoneHref: string;
  birthdayDisplay: string;
  birthdayDateTime: string;
  location: string;
  showContactsLabel: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  servicesHeading: string;
  testimonialsHeading: string;
  clientsHeading: string;
  resumeHeading: string;
  educationHeading: string;
  experienceHeading: string;
  skillsHeading: string;
  portfolioHeading: string;
  blogHeading: string;
  contactHeading: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<ProfileDocument>(
  {
    singletonKey: {
      type: String,
      required: true,
      default: 'default',
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    professionalTitle: { type: String, required: true, trim: true },
    avatarUrl: { type: String, required: true, trim: true },
    avatarPublicId: { type: String, trim: true },
    avatarAlt: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneHref: { type: String, required: true, trim: true },
    birthdayDisplay: { type: String, required: true, trim: true },
    birthdayDateTime: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    showContactsLabel: {
      type: String,
      required: true,
      trim: true,
      default: 'Show Contacts',
    },
    aboutHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'About me',
    },
    aboutParagraphs: {
      type: [String],
      required: true,
      default: [],
    },
    servicesHeading: {
      type: String,
      required: true,
      trim: true,
      default: "What i'm doing",
    },
    testimonialsHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Testimonials',
    },
    clientsHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Clients',
    },
    resumeHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Resume',
    },
    educationHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Education',
    },
    experienceHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Experience',
    },
    skillsHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'My skills',
    },
    portfolioHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Portfolio',
    },
    blogHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Blog',
    },
    contactHeading: {
      type: String,
      required: true,
      trim: true,
      default: 'Contact',
    },
  },
  { timestamps: true }
);

export const ProfileModel: Model<ProfileDocument> =
  (mongoose.models.Profile as Model<ProfileDocument>) ||
  mongoose.model<ProfileDocument>('Profile', profileSchema);
