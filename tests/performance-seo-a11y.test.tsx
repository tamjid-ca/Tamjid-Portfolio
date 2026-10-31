import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/(public)/page';
import { generateMetadata } from '@/app/layout';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { buildPortfolioStructuredData } from '@/lib/seo/structured-data';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';

describe('Phase 9 — Performance, SEO, Structured Data & Accessibility', () => {
  it('generates canonical sitemap.xml entries', () => {
    const entries = sitemap();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toContain('https://');
    expect(entries[0]?.priority).toBe(1);
    expect(entries[0]?.changeFrequency).toBe('weekly');
  });

  it('generates robots.txt rules allowing public routes and disallowing /admin and /api', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    expect(rules[0]?.allow).toBe('/');
    expect(rules[0]?.disallow).toEqual(
      expect.arrayContaining(['/admin', '/admin/', '/api', '/api/'])
    );
    expect(config.sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it('builds Schema.org Person, WebSite, and ItemList JSON-LD structured data and injects it on HomePage', async () => {
    const jsonLd = buildPortfolioStructuredData(V1_PORTFOLIO_SEED_DATA);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@graph']).toHaveLength(3);

    const personNode = jsonLd['@graph'][0] as {
      '@type': string;
      name: string;
      knowsAbout: string[];
    };
    expect(personNode['@type']).toBe('Person');
    expect(personNode.name).toBe('MD. Tamjid Hossain');
    expect(personNode.knowsAbout).toContain('Python');

    const pageElement = await HomePage();
    const { container } = render(pageElement);
    const ldScript = container.querySelector('script[data-json-ld="portfolio"]');
    expect(ldScript).not.toBeNull();
    expect(ldScript?.textContent).toContain('MD. Tamjid Hossain');
  });

  it('enriches generateMetadata() with canonical URL, robots, OpenGraph, and Twitter card fields', async () => {
    const meta = await generateMetadata();
    expect(meta.metadataBase).toBeInstanceOf(URL);
    expect(meta.alternates?.canonical).toBe('/');
    expect(meta.openGraph?.siteName).toBe('MD. Tamjid Hossain');
    expect(meta.twitter).toBeDefined();
  });

  it('enforces WCAG keyboard skip-link, semantic landmarks, and above/below-the-fold image loading attributes', () => {
    const { container } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );

    // Skip link & target landmark
    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink).toHaveAttribute('href', '#main-portfolio-content');
    expect(
      container.querySelector('#main-portfolio-content')
    ).not.toBeNull();

    // Semantic landmarks
    expect(container.querySelector('main')).not.toBeNull();
    expect(container.querySelector('aside.sidebar')).not.toBeNull();
    expect(
      container.querySelector('nav[aria-label="Primary Portfolio Navigation"]')
    ).not.toBeNull();

    // Image alt and loading attributes
    const allImages = Array.from(container.querySelectorAll('img'));
    expect(allImages.length).toBeGreaterThan(15);
    for (const img of allImages) {
      expect(img.hasAttribute('alt')).toBe(true);
    }

    const avatarImg = container.querySelector('.avatar-box img');
    expect(avatarImg?.getAttribute('loading')).toBe('eager');

    const projectImg = container.querySelector('.project-img img');
    expect(projectImg?.getAttribute('loading')).toBe('lazy');
  });
});
