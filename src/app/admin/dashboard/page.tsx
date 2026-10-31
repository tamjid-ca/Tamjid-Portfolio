import React from 'react';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { contactService } from '@/services/contact-service';
import { cloudinaryMediaService } from '@/services/media-service';
import { portfolioService } from '@/services/portfolio-service';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
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
      initialTab="dashboard"
    />
  );
}
