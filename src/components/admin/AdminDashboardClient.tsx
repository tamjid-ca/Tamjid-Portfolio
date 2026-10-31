'use client';

import React, { useState } from 'react';
import type { MediaAssetWithReferencesDTO } from '@/services/media-service';
import type {
  ContactMessageDTO,
  IonIconName,
  PortfolioDataDTO,
  PublicationStatus,
} from '@/types/portfolio';

export type AdminTabKey =
  | 'dashboard'
  | 'profile'
  | 'settings'
  | 'projects'
  | 'resume'
  | 'about'
  | 'blog'
  | 'navigation'
  | 'media'
  | 'messages';

interface AdminDashboardClientProps {
  initialData: PortfolioDataDTO;
  initialMessages: ContactMessageDTO[];
  initialMediaAssets: MediaAssetWithReferencesDTO[];
  initialTab?: AdminTabKey;
}

const NAV_TABS: Array<{ key: AdminTabKey; label: string }> = [
  { key: 'dashboard', label: 'Overview' },
  { key: 'profile', label: 'Profile & Headings' },
  { key: 'projects', label: 'Projects' },
  { key: 'resume', label: 'Resume & Skills' },
  { key: 'about', label: 'Services & Testimonials' },
  { key: 'blog', label: 'Blog Posts' },
  { key: 'navigation', label: 'Navigation & Socials' },
  { key: 'media', label: 'Cloudinary Media' },
  { key: 'messages', label: 'Contact Inbox' },
  { key: 'settings', label: 'Site & Appearance' },
];

export function AdminDashboardClient({
  initialData,
  initialMessages,
  initialMediaAssets,
  initialTab = 'dashboard',
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTabKey>(initialTab);
  const [data, setData] = useState<PortfolioDataDTO>(initialData);
  const [messages, setMessages] =
    useState<ContactMessageDTO[]>(initialMessages);
  const [mediaAssets, setMediaAssets] =
    useState<MediaAssetWithReferencesDTO[]>(initialMediaAssets);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState(initialData.profile);
  const [aboutParagraphsText, setAboutParagraphsText] = useState(
    initialData.profile.aboutParagraphs.join('\n\n')
  );

  // SiteSettings form state
  const [settingsForm, setSettingsForm] = useState(initialData.siteSettings);
  const [seoKeywordsText, setSeoKeywordsText] = useState(
    initialData.siteSettings.seoKeywords.join(', ')
  );

  // New Project form state
  const [newProject, setNewProject] = useState({
    title: '',
    slug: '',
    category: 'Web development',
    filterCategory: 'web development',
    thumbnailUrl: '/assets/images/my-avatar.jpg',
    thumbnailAlt: '',
    liveUrl: '#',
    featured: false,
    status: 'published' as PublicationStatus,
  });

  // New Skill form state
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming',
    percentageValue: 80,
    percentageLabel: '80%',
  });

  // New Education form state
  const [newEdu, setNewEdu] = useState({
    institution: '',
    degree: '',
    dateRange: '',
    description: '',
  });

  // New Experience form state
  const [newExp, setNewExp] = useState({
    position: '',
    company: '',
    dateRange: '',
    description: '',
  });

  // New Achievement form state
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    issuer: '',
    dateDisplay: '',
    description: '',
    status: 'published' as PublicationStatus,
  });

  // New Service form state
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    iconUrl: '/assets/images/my-avatar.jpg',
    iconAlt: 'service icon',
  });

  // New Testimonial form state
  const [newTestimonial, setNewTestimonial] = useState({
    clientName: '',
    text: '',
    avatarUrl: '/assets/images/my-avatar.jpg',
    avatarAlt: '',
    dateDisplay: '14 June, 2021',
    dateISO: '2021-06-14',
    status: 'published' as PublicationStatus,
  });

  // New Blog Post form state
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    category: 'Design',
    publishedDateDisplay: 'Oct 15, 2023',
    publishedDateISO: '2023-10-15',
    excerpt: '',
    bannerUrl: '/assets/images/my-avatar.jpg',
    bannerAlt: 'Blog post',
    externalUrl: '#',
    status: 'published' as PublicationStatus,
  });

  // New Social Link form state
  const [newSocial, setNewSocial] = useState({
    platform: '',
    url: '',
    iconName: 'logo-github' as IonIconName,
  });

  // New Media Asset registration state
  const [newMedia, setNewMedia] = useState({
    publicId: 'portfolio/projects/',
    secureUrl: '',
    folder: 'portfolio/projects',
    format: 'webp',
    bytes: 50000,
    altText: '',
  });

  const refreshAdminSnapshot = async () => {
    const res = await fetch('/api/admin/portfolio', { method: 'GET' });
    if (!res.ok) return;
    const payload = (await res.json()) as {
      ok: boolean;
      data: PortfolioDataDTO;
      messages: ContactMessageDTO[];
      mediaAssets: MediaAssetWithReferencesDTO[];
    };
    if (payload.ok) {
      setData(payload.data);
      setProfileForm(payload.data.profile);
      setAboutParagraphsText(payload.data.profile.aboutParagraphs.join('\n\n'));
      setSettingsForm(payload.data.siteSettings);
      setSeoKeywordsText(payload.data.siteSettings.seoKeywords.join(', '));
      setMessages(payload.messages);
      setMediaAssets(payload.mediaAssets);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const paragraphs = aboutParagraphsText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'profile',
          payload: {
            ...profileForm,
            aboutParagraphs:
              paragraphs.length > 0
                ? paragraphs
                : profileForm.aboutParagraphs,
          },
        }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? 'Failed to update profile.');
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: 'Profile & section headings updated and public cache revalidated.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save profile.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const keywords = seoKeywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'siteSettings',
          payload: {
            ...settingsForm,
            seoKeywords: keywords,
          },
        }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? 'Failed to update site settings.');
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: 'Site settings saved and public cache revalidated.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save settings.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? 'Failed to seed database.');
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: 'V1 portfolio data synced idempotently to MongoDB.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to seed database.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateEntity = async (entity: string, payload: unknown) => {
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, payload }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? `Failed to create ${entity} item.`);
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: `Created new ${entity} item successfully.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Create operation failed.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdateEntity = async (
    entity: string,
    id: string,
    payload: unknown
  ) => {
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id, payload }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? `Failed to update ${entity} item.`);
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: `Updated ${entity} item successfully.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Update operation failed.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteEntity = async (entity: string, id: string) => {
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? `Failed to delete ${entity} item.`);
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: `Deleted item from ${entity}.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Delete operation failed.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleMoveItem = async (
    collection: string,
    ids: string[],
    index: number,
    direction: -1 | 1
  ) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= ids.length) return;
    const reordered = [...ids];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved!);

    setIsBusy(true);
    try {
      await fetch('/api/admin/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          collection,
          orderedIds: reordered,
        }),
      });
      await refreshAdminSnapshot();
    } finally {
      setIsBusy(false);
    }
  };

  const handleRegisterMediaAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/uploads/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMedia,
          url: newMedia.secureUrl,
          resourceType: 'image',
        }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? 'Failed to register media asset.');
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: 'Media asset registered in Cloudinary library.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Media registration failed.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteMediaAsset = async (publicId: string) => {
    setIsBusy(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/uploads/assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? 'Cannot delete referenced media asset.');
      }
      await refreshAdminSnapshot();
      setStatusBanner({
        type: 'success',
        text: `Deleted media asset ${publicId}.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Media deletion blocked.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleToggleMessageRead = async (id: string, isRead: boolean) => {
    setIsBusy(true);
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead }),
      });
      await refreshAdminSnapshot();
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    setIsBusy(true);
    try {
      await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await refreshAdminSnapshot();
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      window.location.assign('/admin/login');
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="admin-shell" data-admin-dashboard>
      <aside className="admin-sidebar" aria-label="Admin CMS Navigation">
        <div className="admin-brand">
          <div className="admin-brand-title">Tamjid CMS V2</div>
          <div className="admin-brand-sub">{data.profile.fullName}</div>
        </div>

        {NAV_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-nav-btn${activeTab === tab.key ? ' active' : ''}`}
            data-admin-tab={tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            style={{ width: '100%' }}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-heading">
            {NAV_TABS.find((t) => t.key === activeTab)?.label ?? 'Dashboard'}
          </h1>
          <div className="admin-btn-row">
            <a href="/" className="admin-btn" target="_blank" rel="noreferrer">
              View Public Site
            </a>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={isBusy}
              onClick={handleSeedDatabase}
            >
              Sync V1 Seed Data
            </button>
          </div>
        </header>

        {statusBanner && (
          <div
            className={`admin-alert ${
              statusBanner.type === 'success'
                ? 'admin-alert-success'
                : 'admin-alert-error'
            }`}
            role="status"
          >
            {statusBanner.text}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <section>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-label">Projects</div>
                <div className="admin-stat-value">{data.projects.length}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Services</div>
                <div className="admin-stat-value">{data.services.length}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Skills</div>
                <div className="admin-stat-value">{data.skills.length}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Testimonials</div>
                <div className="admin-stat-value">
                  {data.testimonials.length}
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Blog Posts</div>
                <div className="admin-stat-value">{data.blogPosts.length}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Unread Messages</div>
                <div className="admin-stat-value">{unreadCount}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Media Assets</div>
                <div className="admin-stat-value">{mediaAssets.length}</div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Profile & Section Headings</h2>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label className="admin-label">Full Name</label>
                  <input
                    className="admin-input"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fullName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Professional Title</label>
                  <input
                    className="admin-input"
                    value={profileForm.professionalTitle}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        professionalTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Email</label>
                  <input
                    className="admin-input"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Phone</label>
                  <input
                    className="admin-input"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Location</label>
                  <input
                    className="admin-input"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Avatar URL</label>
                  <input
                    className="admin-input"
                    value={profileForm.avatarUrl}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        avatarUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  About Biography Paragraphs (separate paragraphs with a blank
                  line)
                </label>
                <textarea
                  className="admin-textarea"
                  value={aboutParagraphsText}
                  onChange={(e) => setAboutParagraphsText(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isBusy}
              >
                Save Profile Changes
              </button>
            </form>
          </section>
        )}

        {activeTab === 'projects' && (
          <section>
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Add New Project</h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEntity('projects', {
                    ...newProject,
                    thumbnailAlt: newProject.thumbnailAlt || newProject.title,
                    displayOrder: data.projects.length + 1,
                  });
                }}
              >
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label className="admin-label">Project Title</label>
                    <input
                      className="admin-input"
                      placeholder="Project Title"
                      required
                      value={newProject.title}
                      onChange={(e) =>
                        setNewProject({ ...newProject, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Slug</label>
                    <input
                      className="admin-input"
                      placeholder="project-slug"
                      required
                      value={newProject.slug}
                      onChange={(e) =>
                        setNewProject({ ...newProject, slug: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Category</label>
                    <input
                      className="admin-input"
                      value={newProject.category}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          category: e.target.value,
                          filterCategory: e.target.value.toLowerCase(),
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Thumbnail URL</label>
                    <input
                      className="admin-input"
                      value={newProject.thumbnailUrl}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          thumbnailUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isBusy}
                >
                  Create Project
                </button>
              </form>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  Existing Projects ({data.projects.length})
                </h2>
              </div>
              <div className="admin-item-list">
                {data.projects.map((project, index) => (
                  <div key={project.id} className="admin-item-row">
                    <div>
                      <strong>{project.title}</strong> —{' '}
                      <span>{project.category}</span>{' '}
                      <span
                        className={`admin-badge${
                          project.status === 'draft' ? ' admin-badge-muted' : ''
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="admin-btn-row">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() =>
                          handleMoveItem(
                            'projects',
                            data.projects.map((p) => p.id),
                            index,
                            -1
                          )
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() =>
                          handleMoveItem(
                            'projects',
                            data.projects.map((p) => p.id),
                            index,
                            1
                          )
                        }
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() =>
                          handleUpdateEntity('projects', project.id, {
                            status:
                              project.status === 'published'
                                ? 'draft'
                                : 'published',
                          })
                        }
                      >
                        {project.status === 'published'
                          ? 'Set Draft'
                          : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() =>
                          handleDeleteEntity('projects', project.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'resume' && (
          <section>
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  Skills ({data.skills.length})
                </h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEntity('skills', {
                    ...newSkill,
                    displayOrder: data.skills.length + 1,
                    visible: true,
                  });
                }}
              >
                <div className="admin-form-grid">
                  <input
                    className="admin-input"
                    placeholder="Skill Name (e.g. TypeScript)"
                    required
                    value={newSkill.name}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, name: e.target.value })
                    }
                  />
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    max={100}
                    value={newSkill.percentageValue}
                    onChange={(e) =>
                      setNewSkill({
                        ...newSkill,
                        percentageValue: Number(e.target.value),
                        percentageLabel: `${e.target.value}%`,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isBusy}
                >
                  Add Skill
                </button>
              </form>
              <div className="admin-item-list" style={{ marginTop: '16px' }}>
                {data.skills.map((skill) => (
                  <div key={skill.id} className="admin-item-row">
                    <span>
                      <strong>{skill.name}</strong> ({skill.percentageLabel} /{' '}
                      {skill.percentageValue}% fill)
                    </span>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDeleteEntity('skills', skill.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  Education ({data.education.length}) & Experience (
                  {data.experience.length}) & Achievements (
                  {data.achievements.length})
                </h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEntity('education', {
                    ...newEdu,
                    displayOrder: data.education.length + 1,
                    visible: true,
                  });
                }}
              >
                <div className="admin-form-grid">
                  <input
                    className="admin-input"
                    placeholder="Institution"
                    value={newEdu.institution}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, institution: e.target.value })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Date Range (e.g. 2021 — 2026)"
                    value={newEdu.dateRange}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, dateRange: e.target.value })
                    }
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Add Education
                </button>
              </form>

              <form
                style={{ marginTop: '16px' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEntity('experience', {
                    ...newExp,
                    displayOrder: data.experience.length + 1,
                    visible: true,
                  });
                }}
              >
                <div className="admin-form-grid">
                  <input
                    className="admin-input"
                    placeholder="Position"
                    required
                    value={newExp.position}
                    onChange={(e) =>
                      setNewExp({ ...newExp, position: e.target.value })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Date Range"
                    value={newExp.dateRange}
                    onChange={(e) =>
                      setNewExp({ ...newExp, dateRange: e.target.value })
                    }
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Add Experience
                </button>
              </form>

              <form
                style={{ marginTop: '16px' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEntity('achievements', {
                    ...newAchievement,
                    displayOrder: data.achievements.length + 1,
                  });
                }}
              >
                <div className="admin-form-grid">
                  <input
                    className="admin-input"
                    placeholder="Achievement Title"
                    required
                    value={newAchievement.title}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        title: e.target.value,
                      })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Issuer"
                    required
                    value={newAchievement.issuer}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        issuer: e.target.value,
                      })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Year / Date"
                    required
                    value={newAchievement.dateDisplay}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        dateDisplay: e.target.value,
                      })
                    }
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Add Achievement
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section>
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  Services ({data.services.length})
                </h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEntity('services', {
                    ...newService,
                    displayOrder: data.services.length + 1,
                    visible: true,
                  });
                }}
              >
                <div className="admin-form-grid">
                  <input
                    className="admin-input"
                    placeholder="Service Title"
                    required
                    value={newService.title}
                    onChange={(e) =>
                      setNewService({ ...newService, title: e.target.value })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Service Description"
                    required
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Add Service
                </button>
              </form>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  Testimonials ({data.testimonials.length}) & Clients (
                  {data.clients.length})
                </h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEntity('testimonials', {
                    ...newTestimonial,
                    avatarAlt:
                      newTestimonial.avatarAlt || newTestimonial.clientName,
                    displayOrder: data.testimonials.length + 1,
                  });
                }}
              >
                <div className="admin-form-grid">
                  <input
                    className="admin-input"
                    placeholder="Client Name"
                    required
                    value={newTestimonial.clientName}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        clientName: e.target.value,
                      })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Testimonial Quote"
                    required
                    value={newTestimonial.text}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        text: e.target.value,
                      })
                    }
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Add Testimonial
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'blog' && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                Blog Posts ({data.blogPosts.length})
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateEntity('blogPosts', {
                  ...newBlog,
                  displayOrder: data.blogPosts.length + 1,
                });
              }}
            >
              <div className="admin-form-grid">
                <input
                  className="admin-input"
                  placeholder="Post Title"
                  required
                  value={newBlog.title}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, title: e.target.value })
                  }
                />
                <input
                  className="admin-input"
                  placeholder="post-slug"
                  required
                  value={newBlog.slug}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, slug: e.target.value })
                  }
                />
                <input
                  className="admin-input"
                  placeholder="Excerpt"
                  required
                  value={newBlog.excerpt}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, excerpt: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Add Blog Post
              </button>
            </form>
          </section>
        )}

        {activeTab === 'navigation' && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                Navigation Items ({data.navigationItems.length}) & Social Links
                ({data.socialLinks.length})
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateEntity('socialLinks', {
                  ...newSocial,
                  displayOrder: data.socialLinks.length + 1,
                  visible: true,
                });
              }}
            >
              <div className="admin-form-grid">
                <input
                  className="admin-input"
                  placeholder="Platform Name"
                  required
                  value={newSocial.platform}
                  onChange={(e) =>
                    setNewSocial({ ...newSocial, platform: e.target.value })
                  }
                />
                <input
                  className="admin-input"
                  placeholder="URL (https://...)"
                  required
                  value={newSocial.url}
                  onChange={(e) =>
                    setNewSocial({ ...newSocial, url: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Add Social Link
              </button>
            </form>
          </section>
        )}

        {activeTab === 'media' && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                Cloudinary Media Library ({mediaAssets.length})
              </h2>
            </div>
            <form onSubmit={handleRegisterMediaAsset}>
              <div className="admin-form-grid">
                <input
                  className="admin-input"
                  placeholder="Public ID (portfolio/projects/...)"
                  required
                  value={newMedia.publicId}
                  onChange={(e) =>
                    setNewMedia({ ...newMedia, publicId: e.target.value })
                  }
                />
                <input
                  className="admin-input"
                  placeholder="Secure Cloudinary URL"
                  required
                  value={newMedia.secureUrl}
                  onChange={(e) =>
                    setNewMedia({ ...newMedia, secureUrl: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Register Media Asset
              </button>
            </form>

            <div className="admin-item-list" style={{ marginTop: '16px' }}>
              {mediaAssets.map((asset) => (
                <div key={asset.id} className="admin-item-row">
                  <div>
                    <strong>{asset.publicId}</strong> ({asset.format})
                    {asset.referencedBy.length > 0 && (
                      <span
                        className="admin-badge"
                        style={{ marginLeft: '8px' }}
                      >
                        In Use: {asset.referencedBy.join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => handleDeleteMediaAsset(asset.publicId)}
                  >
                    Delete Asset
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                Contact Form Submissions ({messages.length})
              </h2>
            </div>
            <div className="admin-item-list">
              {messages.map((msg) => (
                <div key={msg.id} className="admin-item-row">
                  <div>
                    <strong>{msg.fullname}</strong> ({msg.email}) —{' '}
                    <span>{msg.message}</span>
                    {!msg.isRead && (
                      <span
                        className="admin-badge"
                        style={{ marginLeft: '8px' }}
                      >
                        Unread
                      </span>
                    )}
                  </div>
                  <div className="admin-btn-row">
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => handleToggleMessageRead(msg.id, !msg.isRead)}
                    >
                      {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDeleteMessage(msg.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                Site Settings, SEO, Theme & 3D Motion
              </h2>
            </div>
            <form onSubmit={handleSaveSettings}>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label className="admin-label">Site Title</label>
                  <input
                    className="admin-input"
                    value={settingsForm.siteTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        siteTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Default Theme</label>
                  <select
                    className="admin-select"
                    value={settingsForm.defaultTheme}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        defaultTheme: e.target.value as 'dark' | 'light',
                      })
                    }
                  >
                    <option value="dark">Dark (Original Default)</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">Site Description</label>
                <textarea
                  className="admin-textarea"
                  value={settingsForm.siteDescription}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      siteDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">SEO Keywords</label>
                <input
                  className="admin-input"
                  value={seoKeywordsText}
                  onChange={(e) => setSeoKeywordsText(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isBusy}
              >
                Save Site Settings
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
