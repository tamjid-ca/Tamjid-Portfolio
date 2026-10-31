import crypto from 'crypto';
import { z } from 'zod';
import { validateAndSanitize } from '@/lib/validation/portfolio-schemas';

export const ALLOWED_CLOUDINARY_FOLDERS = [
  'portfolio/profile',
  'portfolio/projects',
  'portfolio/experience',
  'portfolio/education',
  'portfolio/certifications',
  'portfolio/testimonials',
  'portfolio/logos',
  'portfolio/blog',
  'portfolio/miscellaneous',
  'tamjid-portfolio/avatars',
  'tamjid-portfolio/projects',
  'tamjid-portfolio/blog',
  'tamjid-portfolio/icons',
  'tamjid-portfolio/certificates',
  'tamjid-portfolio/clients',
] as const;

export type AllowedCloudinaryFolder =
  (typeof ALLOWED_CLOUDINARY_FOLDERS)[number];

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export class CloudinaryConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudinaryConfigurationError';
  }
}

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaValidationError';
  }
}

const IMAGE_MIME_TO_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
  'image/svg+xml': ['svg'],
  'image/gif': ['gif'],
};

const VIDEO_MIME_TO_EXTENSIONS: Record<string, string[]> = {
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
};

const RAW_MIME_TO_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['pdf'],
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_RAW_BYTES = 15 * 1024 * 1024; // 15 MB

export const signedUploadRequestSchema = z.object({
  folder: z.enum(ALLOWED_CLOUDINARY_FOLDERS).default('portfolio/miscellaneous'),
  fileName: z.string().trim().min(1).max(240),
  mimeType: z.string().trim().min(1).max(120),
  bytes: z.number().int().positive(),
  customPublicId: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
});

export type SignedUploadRequestInput = z.infer<
  typeof signedUploadRequestSchema
>;

export interface SignedUploadPayload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: AllowedCloudinaryFolder;
  resourceType: 'image' | 'video' | 'raw';
  publicId?: string;
  signature: string;
  uploadUrl: string;
}

export function getCloudinaryConfig(
  overrides?: Partial<CloudinaryConfig>
): CloudinaryConfig {
  const cloudName = (
    overrides?.cloudName ??
    process.env.CLOUDINARY_CLOUD_NAME ??
    ''
  ).trim();
  const apiKey = (
    overrides?.apiKey ??
    process.env.CLOUDINARY_API_KEY ??
    ''
  ).trim();
  const apiSecret = (
    overrides?.apiSecret ??
    process.env.CLOUDINARY_API_SECRET ??
    ''
  ).trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryConfigurationError(
      'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured.'
    );
  }

  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

export function validateUploadFileConstraints(input: {
  fileName: string;
  mimeType: string;
  bytes: number;
}): { resourceType: 'image' | 'video' | 'raw'; extension: string } {
  const normalizedMime = input.mimeType.trim().toLowerCase();
  const extMatch = input.fileName.trim().toLowerCase().split('.').pop() ?? '';

  if (!extMatch || extMatch === input.fileName.trim().toLowerCase()) {
    throw new MediaValidationError('File name must include a valid extension.');
  }

  if (normalizedMime in IMAGE_MIME_TO_EXTENSIONS) {
    const allowedExts = IMAGE_MIME_TO_EXTENSIONS[normalizedMime]!;
    if (!allowedExts.includes(extMatch)) {
      throw new MediaValidationError(
        `File extension ".${extMatch}" does not match MIME type "${normalizedMime}".`
      );
    }
    if (input.bytes > MAX_IMAGE_BYTES) {
      throw new MediaValidationError(
        `Image size (${input.bytes} bytes) exceeds maximum limit of ${MAX_IMAGE_BYTES} bytes (10 MB).`
      );
    }
    return { resourceType: 'image', extension: extMatch };
  }

  if (normalizedMime in VIDEO_MIME_TO_EXTENSIONS) {
    const allowedExts = VIDEO_MIME_TO_EXTENSIONS[normalizedMime]!;
    if (!allowedExts.includes(extMatch)) {
      throw new MediaValidationError(
        `File extension ".${extMatch}" does not match MIME type "${normalizedMime}".`
      );
    }
    if (input.bytes > MAX_VIDEO_BYTES) {
      throw new MediaValidationError(
        `Video size (${input.bytes} bytes) exceeds maximum limit of ${MAX_VIDEO_BYTES} bytes (50 MB).`
      );
    }
    return { resourceType: 'video', extension: extMatch };
  }

  if (normalizedMime in RAW_MIME_TO_EXTENSIONS) {
    const allowedExts = RAW_MIME_TO_EXTENSIONS[normalizedMime]!;
    if (!allowedExts.includes(extMatch)) {
      throw new MediaValidationError(
        `File extension ".${extMatch}" does not match MIME type "${normalizedMime}".`
      );
    }
    if (input.bytes > MAX_RAW_BYTES) {
      throw new MediaValidationError(
        `Document size (${input.bytes} bytes) exceeds maximum limit of ${MAX_RAW_BYTES} bytes (15 MB).`
      );
    }
    return { resourceType: 'raw', extension: extMatch };
  }

  throw new MediaValidationError(
    `Unsupported file MIME type "${normalizedMime}". Allowed types: JPEG, PNG, WebP, AVIF, SVG, GIF, MP4, WebM, PDF.`
  );
}

/**
 * Computes a Cloudinary API signature over sorted parameters.
 */
export function signCloudinaryParams(
  params: Record<string, string | number | undefined>,
  apiSecret: string,
  algorithm: 'sha1' | 'sha256' = 'sha256'
): string {
  const serializedPairs = Object.keys(params)
    .filter(
      (key) =>
        params[key] !== undefined &&
        params[key] !== null &&
        String(params[key]).length > 0
    )
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash(algorithm)
    .update(`${serializedPairs}${apiSecret}`)
    .digest('hex');
}

export function createSignedUploadPayload(
  rawInput: unknown,
  configOverrides?: Partial<CloudinaryConfig>,
  timestampOverride?: number
): SignedUploadPayload {
  const validated = validateAndSanitize(signedUploadRequestSchema, rawInput);
  const { resourceType } = validateUploadFileConstraints({
    fileName: validated.fileName,
    mimeType: validated.mimeType,
    bytes: validated.bytes,
  });

  const config = getCloudinaryConfig(configOverrides);
  const timestamp = timestampOverride ?? Math.floor(Date.now() / 1000);

  const paramsToSign: Record<string, string | number | undefined> = {
    folder: validated.folder,
    public_id: validated.customPublicId,
    timestamp,
  };

  const signature = signCloudinaryParams(paramsToSign, config.apiSecret);

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    folder: validated.folder,
    resourceType,
    ...(validated.customPublicId ? { publicId: validated.customPublicId } : {}),
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
  };
}

export function isApprovedMediaPublicId(publicId: string): boolean {
  const trimmed = publicId.trim();
  return (
    (trimmed.startsWith('portfolio/') ||
      trimmed.startsWith('tamjid-portfolio/')) &&
    !trimmed.includes('..')
  );
}
