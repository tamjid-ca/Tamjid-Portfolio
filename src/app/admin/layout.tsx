import type { Metadata } from 'next';
import React from 'react';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin CMS — MD. Tamjid Hossain Portfolio',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-cms-root">{children}</div>;
}
