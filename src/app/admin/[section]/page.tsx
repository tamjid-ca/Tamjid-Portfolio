import { notFound } from 'next/navigation';
import React from 'react';
import {
  AdminDashboardClient,
  type AdminTabKey,
} from '@/components/admin/AdminDashboardClient';
import { contactService } from '@/services/contact-service';
import { cloudinaryMediaService } from '@/services/media-service';
import { portfolioService } from '@/services/portfolio-service';

export const dynamic = 'force-dynamic';

const SECTION_TO_TAB: Record<string, AdminTabKey> = {
  profile: 'profile',
  about: 'about',
  services: 'about',
  testimonials: 'about',
  resume: 'resume',
  education: 'resume',
  experience: 'resume',
  skills: 'resume',
  achievements: 'resume',
  projects: 'projects',
  blog: 'blog',
  navigation: 'navigation',
  'social-links': 'navigation',
  media: 'media',
  messages: 'messages',
  appearance: 'settings',
  settings: 'settings',
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const resolvedTab = SECTION_TO_TAB[section.toLowerCase()];

  if (!resolvedTab) {
    notFound();
  }

  const [data, messages, mediaAssets] = await Promise.all([
    portfolioService.getAdminPortfolioData(),
    contactService.listMessages(),
    cloudinaryMediaService.listAssets(),
  ]);

  return (
    <AdminDashboardClient
      initialData={data}
      initialMessages={messages}
      initialMediaAssets={mediaAssets}
      initialTab={resolvedTab}
    />
  );
}
