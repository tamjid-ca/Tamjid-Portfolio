'use client';

import React, { useState } from 'react';
import type { ProfileDTO, SiteSettingsDTO } from '@/types/portfolio';
import { IonIcon } from '@/components/ui/IonIcon';

interface ContactSectionProps {
  isActive: boolean;
  profile: ProfileDTO;
  siteSettings: SiteSettingsDTO;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactSection({
  isActive,
  profile,
  siteSettings,
}: ContactSectionProps) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    fullname.trim().length > 0 &&
    EMAIL_PATTERN.test(email.trim()) &&
    message.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: fullname.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Message sent successfully!');
      }
      setFullname('');
      setEmail('');
      setMessage('');
    } catch {
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article
      className={`contact${isActive ? ' active' : ''}`}
      data-page="contact"
    >
      <header>
        <h2 className="h2 article-title">{profile.contactHeading}</h2>
      </header>

      <section className="mapbox" data-mapbox>
        <figure>
          <iframe
            src={siteSettings.mapEmbedUrl}
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          />
        </figure>
      </section>

      <section className="contact-form">
        <h3 className="h3 form-title">{siteSettings.contactFormTitle}</h3>

        <form action="#" className="form" data-form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="text"
              name="fullname"
              className="form-input"
              placeholder="Full name"
              aria-label="Full name"
              required
              data-form-input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />

            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              aria-label="Email address"
              required
              data-form-input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <textarea
            name="message"
            className="form-input"
            placeholder="Your Message"
            aria-label="Your Message"
            required
            data-form-input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            className="form-btn"
            type="submit"
            disabled={!isFormValid || isSubmitting}
            data-form-btn
          >
            <IonIcon name="paper-plane" />
            <span>
              {isSubmitting ? 'Sending...' : siteSettings.contactSubmitLabel}
            </span>
          </button>
        </form>
      </section>
    </article>
  );
}
