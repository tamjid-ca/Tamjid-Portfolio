export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'thumb';
  cloudName?: string;
}

const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';

function formatTransformString(options: CloudinaryTransformOptions = {}): string {
  const parts: string[] = [
    `f_${options.format ?? 'auto'}`,
    `q_${options.quality ?? 'auto'}`,
  ];

  if (options.crop) {
    parts.push(`c_${options.crop}`);
  } else if (options.width || options.height) {
    parts.push('c_limit');
  }

  if (options.width && options.width > 0) {
    parts.push(`w_${Math.round(options.width)}`);
  }

  if (options.height && options.height > 0) {
    parts.push(`h_${Math.round(options.height)}`);
  }

  return parts.join(',');
}

/**
 * Transforms a Cloudinary URL or publicId into an optimized delivery URL (`f_auto,q_auto,w_...`).
 * Leaves local static paths (`/assets/images/...`), data URIs, and non-Cloudinary URLs unchanged.
 */
export function buildCloudinaryImageUrl(
  urlOrPublicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const raw = urlOrPublicId.trim();
  if (!raw || raw === '#' || raw.startsWith('/') || raw.startsWith('data:')) {
    return raw;
  }

  const transformSegment = formatTransformString(options);

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (!raw.includes('res.cloudinary.com') || !raw.includes(CLOUDINARY_UPLOAD_MARKER)) {
      return raw;
    }

    const [prefix, suffix] = raw.split(CLOUDINARY_UPLOAD_MARKER);
    if (!prefix || !suffix) {
      return raw;
    }

    const cleanSuffix = suffix.replace(/^f_[^/]+\//, '');
    return `${prefix}${CLOUDINARY_UPLOAD_MARKER}${transformSegment}/${cleanSuffix}`;
  }

  const resolvedCloud = (
    options.cloudName ??
    process.env.CLOUDINARY_CLOUD_NAME ??
    ''
  ).trim();

  if (!resolvedCloud) {
    return raw;
  }

  const cleanPublicId = raw.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${resolvedCloud}/image/upload/${transformSegment}/${cleanPublicId}`;
}

export function buildResponsiveSrcSet(
  urlOrPublicId: string,
  widths: number[] = [320, 640, 960, 1280],
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string | undefined {
  const raw = urlOrPublicId.trim();
  const isCloudinaryUrl =
    raw.includes('res.cloudinary.com') && raw.includes(CLOUDINARY_UPLOAD_MARKER);
  const isPublicId =
    !raw.startsWith('/') &&
    !raw.startsWith('http://') &&
    !raw.startsWith('https://') &&
    !raw.startsWith('#') &&
    !raw.startsWith('data:') &&
    Boolean(options.cloudName || process.env.CLOUDINARY_CLOUD_NAME);

  if (!isCloudinaryUrl && !isPublicId) {
    return undefined;
  }

  return widths
    .map(
      (width) =>
        `${buildCloudinaryImageUrl(raw, { ...options, width })} ${width}w`
    )
    .join(', ');
}
