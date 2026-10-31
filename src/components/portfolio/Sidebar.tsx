'use client';

import React, { useState } from 'react';
import type { ProfileDTO, SocialLinkDTO } from '@/types/portfolio';
import { buildCloudinaryImageUrl } from '@/lib/cloudinary/url';
import { IonIcon } from '@/components/ui/IonIcon';

interface SidebarProps {
  profile: ProfileDTO;
  socialLinks: SocialLinkDTO[];
}

export function Sidebar({ profile, socialLinks }: SidebarProps) {
  const [isActive, setIsActive] = useState(false);

  const visibleSocials = [...socialLinks]
    .filter((link) => link.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <aside className={`sidebar${isActive ? ' active' : ''}`} data-sidebar>
      <div className="sidebar-info">
        <figure className="avatar-box">
          <img
            src={buildCloudinaryImageUrl(profile.avatarUrl, { width: 240 })}
            alt={profile.avatarAlt}
            width={80}
          />
        </figure>

        <div className="info-content">
          <h1 className="name" title={profile.fullName}>
            {profile.fullName}
          </h1>
          <p className="title">{profile.professionalTitle}</p>
        </div>

        <button
          type="button"
          className="info_more-btn"
          data-sidebar-btn
          aria-expanded={isActive}
          aria-label={profile.showContactsLabel}
          onClick={() => setIsActive((prev) => !prev)}
        >
          <span>{profile.showContactsLabel}</span>
          <IonIcon name="chevron-down" />
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator" />

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box">
              <IonIcon name="mail-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href={`mailto:${profile.email}`} className="contact-link">
                {profile.email}
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <IonIcon name="phone-portrait-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href={profile.phoneHref} className="contact-link">
                {profile.phone}
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <IonIcon name="calendar-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Birthday</p>
              <time dateTime={profile.birthdayDateTime}>
                {profile.birthdayDisplay}
              </time>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <IonIcon name="location-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>{profile.location}</address>
            </div>
          </li>
        </ul>

        <div className="separator" />

        <ul className="social-list">
          {visibleSocials.map((social) => (
            <li key={social.id} className="social-item">
              <a
                href={social.url}
                className="social-link"
                aria-label={social.platform}
              >
                <IonIcon name={social.iconName} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
