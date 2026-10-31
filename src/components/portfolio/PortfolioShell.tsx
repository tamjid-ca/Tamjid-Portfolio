'use client';

import React, { useState } from 'react';
import type { PortfolioDataDTO, PortfolioPageSlug } from '@/types/portfolio';
import { Sidebar } from '@/components/portfolio/Sidebar';
import { Navbar } from '@/components/portfolio/Navbar';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { ResumeSection } from '@/components/portfolio/ResumeSection';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { BlogSection } from '@/components/portfolio/BlogSection';
import { ContactSection } from '@/components/portfolio/ContactSection';

interface PortfolioShellProps {
  data: PortfolioDataDTO;
}

export function PortfolioShell({ data }: PortfolioShellProps) {
  const visibleNavItems = [...data.navigationItems]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const defaultNav =
    visibleNavItems.find((item) => item.isDefault)?.slug ??
    visibleNavItems[0]?.slug ??
    'about';

  const [activePage, setActivePage] = useState<PortfolioPageSlug>(defaultNav);

  const resolvedActivePage = visibleNavItems.some(
    (item) => item.slug === activePage
  )
    ? activePage
    : defaultNav;

  const handleNavigate = (page: PortfolioPageSlug) => {
    setActivePage(page);
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
  };

  return (
    <main>
      <Sidebar profile={data.profile} socialLinks={data.socialLinks} />

      <div className="main-content">
        <Navbar
          navigationItems={data.navigationItems}
          activePage={resolvedActivePage}
          onNavigate={handleNavigate}
        />

        <AboutSection
          isActive={resolvedActivePage === 'about'}
          profile={data.profile}
          services={data.services}
          testimonials={data.testimonials}
          clients={data.clients}
        />

        <ResumeSection
          isActive={resolvedActivePage === 'resume'}
          profile={data.profile}
          education={data.education}
          experience={data.experience}
          skills={data.skills}
          achievements={data.achievements}
        />

        <PortfolioSection
          isActive={resolvedActivePage === 'portfolio'}
          profile={data.profile}
          projects={data.projects}
          categories={data.projectCategories}
        />

        <BlogSection
          isActive={resolvedActivePage === 'blog'}
          profile={data.profile}
          blogPosts={data.blogPosts}
        />

        <ContactSection
          isActive={resolvedActivePage === 'contact'}
          profile={data.profile}
          siteSettings={data.siteSettings}
        />
      </div>
    </main>
  );
}
