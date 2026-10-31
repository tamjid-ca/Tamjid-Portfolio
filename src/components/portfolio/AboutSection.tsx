'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type {
  ProfileDTO,
  ServiceDTO,
  TestimonialDTO,
  ClientLogoDTO,
} from '@/types/portfolio';
import { buildCloudinaryImageUrl } from '@/lib/cloudinary/url';
import { IonIcon } from '@/components/ui/IonIcon';

interface AboutSectionProps {
  isActive: boolean;
  profile: ProfileDTO;
  services: ServiceDTO[];
  testimonials: TestimonialDTO[];
  clients: ClientLogoDTO[];
}

export function AboutSection({
  isActive,
  profile,
  services,
  testimonials,
  clients,
}: AboutSectionProps) {
  const publishedTestimonials = [...testimonials]
    .filter((item) => item.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const visibleServices = [...services]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const visibleClients = [...clients]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [activeTestimonial, setActiveTestimonial] =
    useState<TestimonialDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayedModalItem =
    activeTestimonial ?? publishedTestimonials[0] ?? null;

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openModal = (item: TestimonialDTO) => {
    setActiveTestimonial(item);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  return (
    <article className={`about${isActive ? ' active' : ''}`} data-page="about">
      <header>
        <h2 className="h2 article-title">{profile.aboutHeading}</h2>
      </header>

      <section className="about-text">
        {profile.aboutParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      <section className="service">
        <h3 className="h3 service-title">{profile.servicesHeading}</h3>

        <ul className="service-list">
          {visibleServices.map((service) => (
            <li key={service.id} className="service-item">
              <div className="service-icon-box">
                <img
                  src={buildCloudinaryImageUrl(service.iconUrl, { width: 120 })}
                  alt={service.iconAlt}
                  width={40}
                />
              </div>

              <div className="service-content-box">
                <h4 className="h4 service-item-title">{service.title}</h4>
                <p className="service-item-text">{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="testimonials">
        <h3 className="h3 testimonials-title">{profile.testimonialsHeading}</h3>

        <ul className="testimonials-list has-scrollbar">
          {publishedTestimonials.map((item) => (
            <li key={item.id} className="testimonials-item">
              <div
                className="content-card"
                data-testimonials-item
                role="button"
                tabIndex={0}
                onClick={() => openModal(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(item);
                  }
                }}
              >
                <figure className="testimonials-avatar-box">
                  <img
                    src={buildCloudinaryImageUrl(item.avatarUrl, { width: 160 })}
                    alt={item.avatarAlt}
                    width={60}
                    data-testimonials-avatar
                  />
                </figure>

                <h4
                  className="h4 testimonials-item-title"
                  data-testimonials-title
                >
                  {item.clientName}
                </h4>

                <div className="testimonials-text" data-testimonials-text>
                  <p>{item.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div
        className={`modal-container${isModalOpen ? ' active' : ''}`}
        data-modal-container
      >
        <div
          className={`overlay${isModalOpen ? ' active' : ''}`}
          data-overlay
          onClick={closeModal}
        />

        <section
          className="testimonials-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Testimonial Details"
        >
          <button
            type="button"
            className="modal-close-btn"
            data-modal-close-btn
            aria-label="Close modal"
            onClick={closeModal}
          >
            <IonIcon name="close-outline" />
          </button>

          <div className="modal-img-wrapper">
            <figure className="modal-avatar-box">
              <img
                src={buildCloudinaryImageUrl(
                  displayedModalItem?.avatarUrl ??
                    '/assets/images/my-avatar.jpg',
                  { width: 200 }
                )}
                alt={displayedModalItem?.avatarAlt ?? 'Client avatar'}
                width={80}
                data-modal-img
              />
            </figure>

            <img src="/assets/images/icon-quote.svg" alt="quote icon" />
          </div>

          <div className="modal-content">
            <h4 className="h3 modal-title" data-modal-title>
              {displayedModalItem?.clientName ?? ''}
            </h4>

            <time dateTime={displayedModalItem?.dateISO ?? '2021-06-14'}>
              {displayedModalItem?.dateDisplay ?? '14 June, 2021'}
            </time>

            <div data-modal-text>
              <p>{displayedModalItem?.text ?? ''}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="clients">
        <h3 className="h3 clients-title">{profile.clientsHeading}</h3>

        <ul className="clients-list has-scrollbar">
          {visibleClients.map((client) => (
            <li key={client.id} className="clients-item">
              <a href={client.websiteUrl} aria-label={client.name}>
                <img
                  src={buildCloudinaryImageUrl(client.logoUrl, { width: 320 })}
                  alt={client.logoAlt}
                />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
