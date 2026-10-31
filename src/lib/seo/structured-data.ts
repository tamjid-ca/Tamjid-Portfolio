import type { PortfolioDataDTO } from '@/types/portfolio';

const DEFAULT_SITE_URL = 'https://tamjid-portfolio.vercel.app';

export function getCanonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return DEFAULT_SITE_URL;
  }
  return raw.replace(/\/+$/, '');
}

export function buildPortfolioStructuredData(data: PortfolioDataDTO) {
  const siteUrl = getCanonicalSiteUrl();
  const avatarUrl = data.profile.avatarUrl.startsWith('http')
    ? data.profile.avatarUrl
    : `${siteUrl}${data.profile.avatarUrl.startsWith('/') ? '' : '/'}${data.profile.avatarUrl}`;

  const sameAs = data.socialLinks
    .filter(
      (link) =>
        link.visible &&
        link.url &&
        link.url !== '#' &&
        link.url.startsWith('http')
    )
    .map((link) => link.url);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: data.profile.fullName,
        jobTitle: data.profile.professionalTitle,
        description: data.siteSettings.siteDescription,
        email: `mailto:${data.profile.email}`,
        telephone: data.profile.phone,
        image: avatarUrl,
        url: siteUrl,
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.profile.location,
        },
        ...(sameAs.length > 0 ? { sameAs } : {}),
        knowsAbout: data.skills
          .filter((skill) => skill.visible)
          .map((skill) => skill.name),
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: data.siteSettings.siteTitle,
        description: data.siteSettings.siteDescription,
        publisher: {
          '@id': `${siteUrl}/#person`,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#projects`,
        name: 'Portfolio Projects',
        itemListElement: data.projects
          .filter((project) => project.status === 'published')
          .map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: project.title,
            url:
              project.liveUrl && project.liveUrl !== '#'
                ? project.liveUrl
                : `${siteUrl}/#${project.slug}`,
          })),
      },
    ],
  };
}
