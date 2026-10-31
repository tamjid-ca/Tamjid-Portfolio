import type { MetadataRoute } from 'next';
import { getCanonicalSiteUrl } from '@/lib/seo/structured-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getCanonicalSiteUrl();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
