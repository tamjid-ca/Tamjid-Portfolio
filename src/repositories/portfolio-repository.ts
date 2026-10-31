import mongoose, { type FilterQuery, type Model } from 'mongoose';
import {
  AchievementModel,
  BlogPostModel,
  ClientLogoModel,
  ContactMessageModel,
  EducationModel,
  ExperienceModel,
  MediaAssetModel,
  NavigationItemModel,
  ProfileModel,
  ProjectModel,
  ServiceModel,
  SiteSettingsModel,
  SkillModel,
  SocialLinkModel,
  TestimonialModel,
} from '@/models';
import type {
  AchievementDTO,
  BlogPostDTO,
  ClientLogoDTO,
  ContactMessageDTO,
  EducationDTO,
  ExperienceDTO,
  MediaAssetDTO,
  NavigationItemDTO,
  ProfileDTO,
  ProjectDTO,
  ServiceDTO,
  SiteSettingsDTO,
  SkillDTO,
  SocialLinkDTO,
  TestimonialDTO,
} from '@/types/portfolio';

type RawLeanDoc = Record<string, unknown> & {
  _id?: unknown;
  createdAt?: Date | string;
};

export function serializeDocument<TDTO>(
  doc: RawLeanDoc | null | undefined,
  options: { includeCreatedAt?: boolean } = {}
): TDTO | null {
  if (!doc) {
    return null;
  }

  const copy: Record<string, unknown> = { ...doc };
  const rawId = copy._id;
  copy.id = rawId ? String(rawId) : String(copy.id ?? '');

  delete copy._id;
  delete copy.__v;
  delete copy.singletonKey;
  delete copy.seedKey;
  delete copy.updatedAt;

  if (options.includeCreatedAt) {
    const rawCreated = copy.createdAt;
    copy.createdAt =
      rawCreated instanceof Date
        ? rawCreated.toISOString()
        : typeof rawCreated === 'string'
          ? rawCreated
          : new Date().toISOString();
  } else {
    delete copy.createdAt;
  }

  return copy as unknown as TDTO;
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export interface OrderedCollectionRepository<
  TDTO extends { id: string; displayOrder: number },
  TInput,
> {
  findAll(): Promise<TDTO[]>;
  findPublic(): Promise<TDTO[]>;
  findById(id: string): Promise<TDTO | null>;
  create(input: TInput & { seedKey?: string }): Promise<TDTO>;
  updateById(id: string, input: Partial<TInput>): Promise<TDTO | null>;
  deleteById(id: string): Promise<boolean>;
  reorder(orderedIds: string[]): Promise<void>;
  upsertBySeedKey(
    seedKey: string,
    input: TInput,
    matchFilter?: Record<string, unknown>
  ): Promise<TDTO>;
}

function createOrderedCollectionRepository<
  TDTO extends { id: string; displayOrder: number },
  TInput extends Record<string, unknown>,
  TDoc extends { _id: mongoose.Types.ObjectId },
>(
  model: Model<TDoc>,
  publicFilter: FilterQuery<TDoc>
): OrderedCollectionRepository<TDTO, TInput> {
  return {
    async findAll(): Promise<TDTO[]> {
      const docs = await model
        .find({})
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean<RawLeanDoc[]>();
      return docs
        .map((doc) => serializeDocument<TDTO>(doc))
        .filter((item): item is TDTO => item !== null);
    },

    async findPublic(): Promise<TDTO[]> {
      const docs = await model
        .find(publicFilter)
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean<RawLeanDoc[]>();
      return docs
        .map((doc) => serializeDocument<TDTO>(doc))
        .filter((item): item is TDTO => item !== null);
    },

    async findById(id: string): Promise<TDTO | null> {
      if (!isValidObjectId(id)) {
        return null;
      }
      const doc = await model.findById(id).lean<RawLeanDoc | null>();
      return serializeDocument<TDTO>(doc);
    },

    async create(input: TInput & { seedKey?: string }): Promise<TDTO> {
      const created = await model.create(input as unknown as Partial<TDoc>);
      const plain = created.toObject() as unknown as RawLeanDoc;
      return serializeDocument<TDTO>(plain)!;
    },

    async updateById(
      id: string,
      input: Partial<TInput>
    ): Promise<TDTO | null> {
      if (!isValidObjectId(id)) {
        return null;
      }
      const updated = await model
        .findByIdAndUpdate(
          id,
          { $set: input as unknown as Partial<TDoc> },
          { new: true, runValidators: true }
        )
        .lean<RawLeanDoc | null>();
      return serializeDocument<TDTO>(updated);
    },

    async deleteById(id: string): Promise<boolean> {
      if (!isValidObjectId(id)) {
        return false;
      }
      const result = await model.findByIdAndDelete(id).lean();
      return Boolean(result);
    },

    async reorder(orderedIds: string[]): Promise<void> {
      const validIds = orderedIds.filter((id) => isValidObjectId(id));
      if (validIds.length === 0) {
        return;
      }
      await Promise.all(
        validIds.map((id, index) =>
          model.findByIdAndUpdate(id, {
            $set: { displayOrder: index + 1 } as unknown as Partial<TDoc>,
          })
        )
      );
    },

    async upsertBySeedKey(
      seedKey: string,
      input: TInput,
      matchFilter?: Record<string, unknown>
    ): Promise<TDTO> {
      const filter = (matchFilter ?? { seedKey }) as FilterQuery<TDoc>;
      const updated = await model
        .findOneAndUpdate(
          filter,
          {
            $set: {
              ...input,
              seedKey,
            } as unknown as Partial<TDoc>,
          },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        )
        .lean<RawLeanDoc>();
      return serializeDocument<TDTO>(updated)!;
    },
  };
}

export const siteSettingsRepository = {
  async get(): Promise<SiteSettingsDTO | null> {
    const doc = await SiteSettingsModel.findOne({ singletonKey: 'default' }).lean<
      RawLeanDoc | null
    >();
    return serializeDocument<SiteSettingsDTO>(doc);
  },

  async upsert(
    input: Omit<SiteSettingsDTO, 'id'>
  ): Promise<SiteSettingsDTO> {
    const doc = await SiteSettingsModel.findOneAndUpdate(
      { singletonKey: 'default' },
      {
        $set: {
          ...input,
          singletonKey: 'default',
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean<RawLeanDoc>();
    return serializeDocument<SiteSettingsDTO>(doc)!;
  },
};

export const profileRepository = {
  async get(): Promise<ProfileDTO | null> {
    const doc = await ProfileModel.findOne({ singletonKey: 'default' }).lean<
      RawLeanDoc | null
    >();
    return serializeDocument<ProfileDTO>(doc);
  },

  async upsert(input: Omit<ProfileDTO, 'id'>): Promise<ProfileDTO> {
    const doc = await ProfileModel.findOneAndUpdate(
      { singletonKey: 'default' },
      {
        $set: {
          ...input,
          singletonKey: 'default',
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean<RawLeanDoc>();
    return serializeDocument<ProfileDTO>(doc)!;
  },
};

export const socialLinkRepository = createOrderedCollectionRepository<
  SocialLinkDTO,
  Omit<SocialLinkDTO, 'id'>,
  import('@/models').SocialLinkDocument
>(SocialLinkModel, { visible: true });

export const navigationItemRepository = {
  ...createOrderedCollectionRepository<
    NavigationItemDTO,
    Omit<NavigationItemDTO, 'id'>,
    import('@/models').NavigationItemDocument
  >(NavigationItemModel, { visible: true }),

  async findBySlug(slug: string): Promise<NavigationItemDTO | null> {
    const doc = await NavigationItemModel.findOne({ slug }).lean<
      RawLeanDoc | null
    >();
    return serializeDocument<NavigationItemDTO>(doc);
  },
};

export const serviceRepository = createOrderedCollectionRepository<
  ServiceDTO,
  Omit<ServiceDTO, 'id'>,
  import('@/models').ServiceDocument
>(ServiceModel, { visible: true });

export const testimonialRepository = createOrderedCollectionRepository<
  TestimonialDTO,
  Omit<TestimonialDTO, 'id'>,
  import('@/models').TestimonialDocument
>(TestimonialModel, { status: 'published' });

export const clientLogoRepository = createOrderedCollectionRepository<
  ClientLogoDTO,
  Omit<ClientLogoDTO, 'id'>,
  import('@/models').ClientLogoDocument
>(ClientLogoModel, { visible: true });

export const educationRepository = createOrderedCollectionRepository<
  EducationDTO,
  Omit<EducationDTO, 'id'>,
  import('@/models').EducationDocument
>(EducationModel, { visible: true });

export const experienceRepository = createOrderedCollectionRepository<
  ExperienceDTO,
  Omit<ExperienceDTO, 'id'>,
  import('@/models').ExperienceDocument
>(ExperienceModel, { visible: true });

export const skillRepository = createOrderedCollectionRepository<
  SkillDTO,
  Omit<SkillDTO, 'id'>,
  import('@/models').SkillDocument
>(SkillModel, { visible: true });

export const achievementRepository = createOrderedCollectionRepository<
  AchievementDTO,
  Omit<AchievementDTO, 'id'>,
  import('@/models').AchievementDocument
>(AchievementModel, { status: 'published' });

export const projectRepository = {
  ...createOrderedCollectionRepository<
    ProjectDTO,
    Omit<ProjectDTO, 'id'>,
    import('@/models').ProjectDocument
  >(ProjectModel, { status: 'published' }),

  async findBySlug(slug: string): Promise<ProjectDTO | null> {
    const doc = await ProjectModel.findOne({
      slug: slug.toLowerCase(),
    }).lean<RawLeanDoc | null>();
    return serializeDocument<ProjectDTO>(doc);
  },
};

export const blogPostRepository = {
  ...createOrderedCollectionRepository<
    BlogPostDTO,
    Omit<BlogPostDTO, 'id'>,
    import('@/models').BlogPostDocument
  >(BlogPostModel, { status: 'published' }),

  async findBySlug(slug: string): Promise<BlogPostDTO | null> {
    const doc = await BlogPostModel.findOne({
      slug: slug.toLowerCase(),
    }).lean<RawLeanDoc | null>();
    return serializeDocument<BlogPostDTO>(doc);
  },
};

export const contactMessageRepository = {
  async findAll(): Promise<ContactMessageDTO[]> {
    const docs = await ContactMessageModel.find({})
      .sort({ createdAt: -1 })
      .lean<RawLeanDoc[]>();
    return docs
      .map((doc) =>
        serializeDocument<ContactMessageDTO>(doc, { includeCreatedAt: true })
      )
      .filter((item): item is ContactMessageDTO => item !== null);
  },

  async findById(id: string): Promise<ContactMessageDTO | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await ContactMessageModel.findById(id).lean<RawLeanDoc | null>();
    return serializeDocument<ContactMessageDTO>(doc, {
      includeCreatedAt: true,
    });
  },

  async create(input: {
    fullname: string;
    email: string;
    message: string;
    ipHash?: string;
  }): Promise<ContactMessageDTO> {
    const created = await ContactMessageModel.create({
      ...input,
      isRead: false,
    });
    const plain = created.toObject() as unknown as RawLeanDoc;
    return serializeDocument<ContactMessageDTO>(plain, {
      includeCreatedAt: true,
    })!;
  },

  async markReadState(
    id: string,
    isRead: boolean
  ): Promise<ContactMessageDTO | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const updated = await ContactMessageModel.findByIdAndUpdate(
      id,
      { $set: { isRead } },
      { new: true }
    ).lean<RawLeanDoc | null>();
    return serializeDocument<ContactMessageDTO>(updated, {
      includeCreatedAt: true,
    });
  },

  async deleteById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }
    const deleted = await ContactMessageModel.findByIdAndDelete(id).lean();
    return Boolean(deleted);
  },
};

export const mediaAssetRepository = {
  async findAll(): Promise<MediaAssetDTO[]> {
    const docs = await MediaAssetModel.find({})
      .sort({ createdAt: -1 })
      .lean<RawLeanDoc[]>();
    return docs
      .map((doc) =>
        serializeDocument<MediaAssetDTO>(doc, { includeCreatedAt: true })
      )
      .filter((item): item is MediaAssetDTO => item !== null);
  },

  async findByPublicId(publicId: string): Promise<MediaAssetDTO | null> {
    const doc = await MediaAssetModel.findOne({ publicId }).lean<
      RawLeanDoc | null
    >();
    return serializeDocument<MediaAssetDTO>(doc, { includeCreatedAt: true });
  },

  async upsertByPublicId(
    input: Omit<MediaAssetDTO, 'id' | 'createdAt'>
  ): Promise<MediaAssetDTO> {
    const doc = await MediaAssetModel.findOneAndUpdate(
      { publicId: input.publicId },
      { $set: input },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean<RawLeanDoc>();
    return serializeDocument<MediaAssetDTO>(doc, { includeCreatedAt: true })!;
  },

  async deleteByPublicId(publicId: string): Promise<boolean> {
    const deleted = await MediaAssetModel.findOneAndDelete({ publicId }).lean();
    return Boolean(deleted);
  },

  async findAssetReferences(publicId: string): Promise<string[]> {
    const references: string[] = [];

    const [
      siteSettingsHit,
      profileHit,
      serviceHit,
      testimonialHit,
      clientHit,
      educationHit,
      experienceHit,
      achievementHit,
      projectHit,
      blogHit,
    ] = await Promise.all([
      SiteSettingsModel.exists({ faviconPublicId: publicId }),
      ProfileModel.exists({ avatarPublicId: publicId }),
      ServiceModel.exists({ iconPublicId: publicId }),
      TestimonialModel.exists({ avatarPublicId: publicId }),
      ClientLogoModel.exists({ logoPublicId: publicId }),
      EducationModel.exists({ logoPublicId: publicId }),
      ExperienceModel.exists({ logoPublicId: publicId }),
      AchievementModel.exists({ certificatePublicId: publicId }),
      ProjectModel.exists({ thumbnailPublicId: publicId }),
      BlogPostModel.exists({ bannerPublicId: publicId }),
    ]);

    if (siteSettingsHit) references.push('SiteSettings');
    if (profileHit) references.push('Profile');
    if (serviceHit) references.push('Service');
    if (testimonialHit) references.push('Testimonial');
    if (clientHit) references.push('ClientLogo');
    if (educationHit) references.push('Education');
    if (experienceHit) references.push('Experience');
    if (achievementHit) references.push('Achievement');
    if (projectHit) references.push('Project');
    if (blogHit) references.push('BlogPost');

    return references;
  },
};
