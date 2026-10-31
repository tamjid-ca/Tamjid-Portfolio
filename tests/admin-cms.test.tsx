import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DELETE as deletePortfolioItem,
  GET as getAdminPortfolio,
  PATCH as patchPortfolioReorder,
  POST as postPortfolioItem,
  PUT as putPortfolioItem,
} from '@/app/api/admin/portfolio/route';
import {
  DELETE as deleteAdminMessage,
  GET as getAdminMessages,
  PATCH as patchAdminMessage,
} from '@/app/api/admin/messages/route';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { UnauthorizedAdminError } from '@/lib/auth/request-guard';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';
import { adminAuthService } from '@/services/auth-service';
import { contactService } from '@/services/contact-service';
import { cloudinaryMediaService } from '@/services/media-service';
import { portfolioService } from '@/services/portfolio-service';

const MOCK_ADMIN_SESSION = {
  sessionId: 'sess-123',
  userId: 'user-123',
  email: 'admin@tamjid.dev',
  role: 'admin' as const,
  exp: Date.now() + 3600_000,
};

describe('Phase 6 — Admin CMS API & UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated requests across /api/admin/portfolio and /api/admin/messages with 401', async () => {
    vi.spyOn(adminAuthService, 'requireAdminSession').mockRejectedValue(
      new UnauthorizedAdminError()
    );

    const getRes = await getAdminPortfolio(
      new Request('http://localhost:3000/api/admin/portfolio')
    );
    expect(getRes.status).toBe(401);

    const postRes = await postPortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        body: JSON.stringify({ entity: 'projects', payload: {} }),
      })
    );
    expect(postRes.status).toBe(401);

    const msgRes = await getAdminMessages(
      new Request('http://localhost:3000/api/admin/messages')
    );
    expect(msgRes.status).toBe(401);
  });

  it('allows authenticated admin to fetch snapshot, update profile, create/update/reorder/delete collections', async () => {
    vi.spyOn(adminAuthService, 'requireAdminSession').mockResolvedValue(
      MOCK_ADMIN_SESSION
    );

    vi.spyOn(portfolioService, 'getAdminPortfolioData').mockResolvedValue(
      V1_PORTFOLIO_SEED_DATA
    );
    vi.spyOn(contactService, 'listMessages').mockResolvedValue([]);
    vi.spyOn(cloudinaryMediaService, 'listAssets').mockResolvedValue([]);

    const snapshotRes = await getAdminPortfolio(
      new Request('http://localhost:3000/api/admin/portfolio')
    );
    expect(snapshotRes.status).toBe(200);
    const snapshotBody = await snapshotRes.json();
    expect(snapshotBody.ok).toBe(true);
    expect(snapshotBody.data.profile.fullName).toBe('MD. Tamjid Hossain');

    // Update profile
    vi.spyOn(portfolioService, 'updateProfile').mockResolvedValue({
      ...V1_PORTFOLIO_SEED_DATA.profile,
      professionalTitle: 'Principal AI & Robotics Researcher',
    });

    const putRes = await putPortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'profile',
          payload: {
            ...V1_PORTFOLIO_SEED_DATA.profile,
            professionalTitle: 'Principal AI & Robotics Researcher',
          },
        }),
      })
    );
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.item.professionalTitle).toBe(
      'Principal AI & Robotics Researcher'
    );

    // Create project
    const mockProject = {
      ...V1_PORTFOLIO_SEED_DATA.projects[0]!,
      id: 'proj-new',
      title: 'Autonomous Drone Swarm',
    };
    vi.spyOn(portfolioService, 'createProject').mockResolvedValue(mockProject);

    const createRes = await postPortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'projects',
          payload: mockProject,
        }),
      })
    );
    expect(createRes.status).toBe(201);

    // Reorder projects
    vi.spyOn(portfolioService, 'reorderCollection').mockResolvedValue();
    const patchRes = await patchPortfolioReorder(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          collection: 'projects',
          orderedIds: ['proj-new', 'proj-1'],
        }),
      })
    );
    expect(patchRes.status).toBe(200);

    // Delete project
    vi.spyOn(portfolioService, 'deleteProject').mockResolvedValue(true);
    const deleteRes = await deletePortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'projects',
          id: 'proj-new',
        }),
      })
    );
    expect(deleteRes.status).toBe(200);
  });

  it('supports listing, marking read/unread, and deleting contact messages via /api/admin/messages', async () => {
    vi.spyOn(adminAuthService, 'requireAdminSession').mockResolvedValue(
      MOCK_ADMIN_SESSION
    );

    const sampleMessage = {
      id: 'msg-1',
      fullname: 'Ada Lovelace',
      email: 'ada@analytical.engine',
      message: 'Interested in collaborating on robotics research.',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(contactService, 'listMessages').mockResolvedValue([sampleMessage]);
    const listRes = await getAdminMessages(
      new Request('http://localhost:3000/api/admin/messages')
    );
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.messages).toHaveLength(1);

    vi.spyOn(contactService, 'markMessageReadState').mockResolvedValue({
      ...sampleMessage,
      isRead: true,
    });
    const patchRes = await patchAdminMessage(
      new Request('http://localhost:3000/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'msg-1', isRead: true }),
      })
    );
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.message.isRead).toBe(true);

    vi.spyOn(contactService, 'deleteMessage').mockResolvedValue(true);
    const delRes = await deleteAdminMessage(
      new Request('http://localhost:3000/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'msg-1' }),
      })
    );
    expect(delRes.status).toBe(200);
  });

  it('renders AdminLoginForm and submits credentials to /api/auth/login', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AdminLoginForm />);

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@tamjid.dev' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'StrongSecret123!' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Sign In to Admin CMS/i })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('renders AdminDashboardClient and navigates across CMS sections', async () => {
    render(
      <AdminDashboardClient
        initialData={V1_PORTFOLIO_SEED_DATA}
        initialMessages={[
          {
            id: 'msg-101',
            fullname: 'Alan Turing',
            email: 'alan@bletchley.uk',
            message: 'Hello Tamjid, great robotics portfolio!',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ]}
        initialMediaAssets={[]}
      />
    );

    expect(
      screen.getByRole('heading', { name: /Overview/i })
    ).toBeInTheDocument();

    // Switch to Profile & Headings tab
    fireEvent.click(
      screen.getByRole('button', { name: /Profile & Headings/i })
    );
    expect(
      screen.getByRole('heading', { name: /Profile & Headings/i })
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('MD. Tamjid Hossain')
    ).toBeInTheDocument();

    // Switch to Projects tab
    fireEvent.click(screen.getByRole('button', { name: /^Projects$/i }));
    expect(
      screen.getByRole('heading', { level: 1, name: /^Projects$/i })
    ).toBeInTheDocument();

    // Switch to Contact Inbox tab
    fireEvent.click(screen.getByRole('button', { name: /Contact Inbox/i }));
    expect(
      screen.getByRole('heading', { level: 1, name: /Contact Inbox/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Alan Turing/i)).toBeInTheDocument();

    // Switch to Site & Appearance tab
    fireEvent.click(screen.getByRole('button', { name: /Site & Appearance/i }));
    expect(
      screen.getByRole('heading', { level: 1, name: /Site & Appearance/i })
    ).toBeInTheDocument();
  });
});
