import {
  createSignedUploadPayload,
  getCloudinaryConfig,
  isApprovedMediaPublicId,
  isCloudinaryConfigured,
  MediaValidationError,
  signCloudinaryParams,
  type CloudinaryConfig,
  type SignedUploadPayload,
} from '@/lib/cloudinary/cloudinary';
import { revalidatePortfolioCache } from '@/lib/cache/revalidate';
import { connectToDatabase } from '@/lib/mongodb/connection';
import {
  mediaAssetInputSchema,
  validateAndSanitize,
} from '@/lib/validation/portfolio-schemas';
import { mediaAssetRepository } from '@/repositories';
import type { MediaAssetDTO } from '@/types/portfolio';
import { MediaAssetInUseError } from './portfolio-service';

export interface MediaAssetWithReferencesDTO extends MediaAssetDTO {
  referencedBy: string[];
}

export const cloudinaryMediaService = {
  createUploadSignature(
    rawInput: unknown,
    configOverrides?: Partial<CloudinaryConfig>,
    timestampOverride?: number
  ): SignedUploadPayload {
    return createSignedUploadPayload(
      rawInput,
      configOverrides,
      timestampOverride
    );
  },

  async registerAsset(rawInput: unknown): Promise<MediaAssetDTO> {
    const validated = validateAndSanitize(mediaAssetInputSchema, rawInput);
    if (!isApprovedMediaPublicId(validated.publicId)) {
      throw new MediaValidationError(
        `Public ID "${validated.publicId}" must reside inside an approved "portfolio/*" or "tamjid-portfolio/*" folder.`
      );
    }

    await connectToDatabase({ strict: false });
    const saved = await mediaAssetRepository.upsertByPublicId(validated);
    revalidatePortfolioCache();
    return saved;
  },

  async listAssets(options?: {
    folder?: string;
  }): Promise<MediaAssetWithReferencesDTO[]> {
    const conn = await connectToDatabase({ strict: false });
    if (!conn) {
      return [];
    }

    const allAssets = await mediaAssetRepository.findAll();
    const filtered = options?.folder
      ? allAssets.filter((asset) => asset.folder === options.folder)
      : allAssets;

    return Promise.all(
      filtered.map(async (asset) => {
        const referencedBy = await mediaAssetRepository.findAssetReferences(
          asset.publicId
        );
        return {
          ...asset,
          referencedBy,
        };
      })
    );
  },

  async deleteAsset(
    publicId: string,
    options?: {
      destroyRemote?: boolean;
      configOverrides?: Partial<CloudinaryConfig>;
    }
  ): Promise<{ deleted: boolean; remoteDestroyed: boolean }> {
    const cleanedId = publicId.trim();
    if (!isApprovedMediaPublicId(cleanedId)) {
      throw new MediaValidationError(
        `Public ID "${cleanedId}" is invalid or outside approved portfolio folders.`
      );
    }

    await connectToDatabase({ strict: false });
    const references =
      await mediaAssetRepository.findAssetReferences(cleanedId);
    if (references.length > 0) {
      throw new MediaAssetInUseError(cleanedId, references);
    }

    const existingAsset = await mediaAssetRepository.findByPublicId(cleanedId);
    const resourceType = existingAsset?.resourceType ?? 'image';

    let remoteDestroyed = false;
    const shouldDestroyRemote =
      options?.destroyRemote !== false &&
      (Boolean(options?.configOverrides) || isCloudinaryConfigured());

    if (shouldDestroyRemote) {
      const config = getCloudinaryConfig(options?.configOverrides);
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = signCloudinaryParams(
        {
          public_id: cleanedId,
          timestamp,
        },
        config.apiSecret
      );

      const destroyUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`;
      const response = await fetch(destroyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: cleanedId,
          timestamp,
          api_key: config.apiKey,
          signature,
        }),
      });

      if (response.ok) {
        remoteDestroyed = true;
      }
    }

    const deleted = await mediaAssetRepository.deleteByPublicId(cleanedId);
    if (deleted) {
      revalidatePortfolioCache();
    }

    return {
      deleted,
      remoteDestroyed,
    };
  },
};
