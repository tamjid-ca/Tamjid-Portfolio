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
  const defaultNav =
    data.navigationItems.find((item) => item.isDefault && item.visible)?.slug ??
    'about';

  const [activePage, setActivePage] = useState<PortfolioPageSlug>(defaultNav);

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
          activePage={activePage}
          onNavigate={handleNavigate}
        />

        <AboutSection
          isActive={activePage === 'about'}
          profile={data.profile}
          services={data.services}
          testimonials={data.testimonials}
          clients={data.clients}
        />

        <ResumeSection
          isActive={activePage === 'resume'}
          profile={data.profile}
          education={data.education}
          experience={data.experience}
          skills={data.skills}
          achievements={data.achievements}
        />

        <PortfolioSection
          isActive={activePage === 'portfolio'}
          profile={data.profile}
          projects={data.projects}
          categories={data.projectCategories}
        />

        <BlogSection
          isActive={activePage === 'blog'}
          profile={data.profile}
          blogPosts={data.blogPosts}
        />

        <ContactSection
          isActive={activePage === 'contact'}
          profile={data.profile}
          siteSettings={data.siteSettings}
        />
      </div>
    </main>
  );
}
