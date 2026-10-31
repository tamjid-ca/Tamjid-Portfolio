import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';
import { POST as contactPost } from '@/app/api/public/contact/route';

describe('Phase 1 — Next.js Portfolio Foundation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Sidebar with exact original profile, contact, and social links', () => {
    const { container } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );

    expect(
      screen.getByRole('heading', { name: 'MD. Tamjid Hossain', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText('IT enthusiast')).toBeInTheDocument();
    expect(
      screen.getByText('mdtamjidhossain.ca@gmail.com')
    ).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('March 19, 2015')).toBeInTheDocument();
    expect(screen.getByText('Canda')).toBeInTheDocument();

    const sidebar = container.querySelector('[data-sidebar]');
    const toggleBtn = container.querySelector('[data-sidebar-btn]');
    expect(sidebar).not.toHaveClass('active');

    fireEvent.click(toggleBtn!);
    expect(sidebar).toHaveClass('active');

    fireEvent.click(toggleBtn!);
    expect(sidebar).not.toHaveClass('active');
  });

  it('switches active article tabs and scrolls to top when navbar links are clicked', () => {
    const { container } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );

    const aboutArticle = container.querySelector('article[data-page="about"]');
    const resumeArticle = container.querySelector(
      'article[data-page="resume"]'
    );
    const portfolioArticle = container.querySelector(
      'article[data-page="portfolio"]'
    );
    const blogArticle = container.querySelector('article[data-page="blog"]');
    const contactArticle = container.querySelector(
      'article[data-page="contact"]'
    );

    expect(aboutArticle).toHaveClass('active');
    expect(resumeArticle).not.toHaveClass('active');

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(resumeArticle).toHaveClass('active');
    expect(aboutArticle).not.toHaveClass('active');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    fireEvent.click(screen.getByRole('button', { name: 'Portfolio' }));
    expect(portfolioArticle).toHaveClass('active');

    fireEvent.click(screen.getByRole('button', { name: 'Blog' }));
    expect(blogArticle).toHaveClass('active');

    fireEvent.click(screen.getByRole('button', { name: 'Contact' }));
    expect(contactArticle).toHaveClass('active');
  });

  it('opens and closes the Testimonials modal with the selected client details', () => {
    const { container } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );

    const modalContainer = container.querySelector('[data-modal-container]');
    expect(modalContainer).not.toHaveClass('active');

    const testimonialCards = container.querySelectorAll(
      '[data-testimonials-item]'
    );
    expect(testimonialCards).toHaveLength(4);

    // Click the second testimonial (Jessica miller)
    fireEvent.click(testimonialCards[1]);
    expect(modalContainer).toHaveClass('active');

    const modalTitle = container.querySelector('[data-modal-title]');
    expect(modalTitle?.textContent).toBe('Jessica miller');

    // Close via Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(modalContainer).not.toHaveClass('active');

    // Reopen and close via close button
    fireEvent.click(testimonialCards[2]);
    expect(modalContainer).toHaveClass('active');
    expect(modalTitle?.textContent).toBe('Emily evans');

    const closeBtn = container.querySelector('[data-modal-close-btn]');
    fireEvent.click(closeBtn!);
    expect(modalContainer).not.toHaveClass('active');
  });

  it('renders Resume education, experience, and skills with exact progress values', () => {
    const { container } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );

    expect(screen.getByText('ALCA')).toBeInTheDocument();
    expect(screen.getByText('2021 — 2026')).toBeInTheDocument();
    expect(screen.getByText('Creative director')).toBeInTheDocument();
    expect(screen.getByText('Art director')).toBeInTheDocument();
    expect(screen.getByText('Web designer')).toBeInTheDocument();

    const skillFills = container.querySelectorAll('.skill-progress-fill');
    expect(skillFills).toHaveLength(4);
    expect(skillFills[0]).toHaveStyle({ width: '80%' });
    expect(skillFills[1]).toHaveStyle({ width: '70%' });
    expect(skillFills[2]).toHaveStyle({ width: '90%' });
    expect(skillFills[3]).toHaveStyle({ width: '50%' });
  });

  it('filters Portfolio projects via both desktop filter buttons and mobile select dropdown', () => {
    const { container } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );

    const getActiveProjects = () =>
      container.querySelectorAll('.project-item.active');

    // All 9 projects active initially
    expect(getActiveProjects()).toHaveLength(9);

    // Filter by Web design via desktop filter button
    const filterButtons = container.querySelectorAll('[data-filter-btn]');
    const webDesignBtn = Array.from(filterButtons).find(
      (btn) => btn.textContent === 'Web design'
    );
    fireEvent.click(webDesignBtn!);
    expect(getActiveProjects()).toHaveLength(3);

    // Filter by Applications via mobile custom dropdown
    const selectToggle = container.querySelector('[data-select]');
    fireEvent.click(selectToggle!);
    expect(selectToggle).toHaveClass('active');

    const selectItems = container.querySelectorAll('[data-select-item]');
    const appsSelectBtn = Array.from(selectItems).find(
      (btn) => btn.textContent === 'Applications'
    );
    fireEvent.click(appsSelectBtn!);
    expect(selectToggle).not.toHaveClass('active');
    expect(getActiveProjects()).toHaveLength(2);

    // Filter by Web development
    const webDevBtn = Array.from(filterButtons).find(
      (btn) => btn.textContent === 'Web development'
    );
    fireEvent.click(webDevBtn!);
    expect(getActiveProjects()).toHaveLength(4);
  });

  it('validates Contact form inputs and submits to /api/public/contact', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );

    const submitBtn = container.querySelector(
      '[data-form-btn]'
    ) as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Full name'), {
      target: { value: 'John Doe' },
    });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'john@example.com' },
    });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Your Message'), {
      target: { value: 'Hello Tamjid!' },
    });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.submit(container.querySelector('[data-form]')!);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/public/contact',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    expect(alertSpy).toHaveBeenCalledWith('Message sent successfully!');
    fetchSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('validates /api/public/contact route handler payloads', async () => {
    const badReq = new Request('http://localhost:3000/api/public/contact', {
      method: 'POST',
      body: JSON.stringify({ fullname: '', email: 'not-an-email', message: '' }),
    });
    const badRes = await contactPost(badReq);
    expect(badRes.status).toBe(400);

    const goodReq = new Request('http://localhost:3000/api/public/contact', {
      method: 'POST',
      body: JSON.stringify({
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Great portfolio!',
      }),
    });
    const goodRes = await contactPost(goodReq);
    expect(goodRes.status).toBe(200);
  });
});
