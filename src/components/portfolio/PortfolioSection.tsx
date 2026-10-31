'use client';

import React, { useState } from 'react';
import type { ProfileDTO, ProjectDTO } from '@/types/portfolio';
import { IonIcon } from '@/components/ui/IonIcon';

interface PortfolioSectionProps {
  isActive: boolean;
  profile: ProfileDTO;
  projects: ProjectDTO[];
  categories: string[];
}

export function PortfolioSection({
  isActive,
  profile,
  projects,
  categories,
}: PortfolioSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectLabel, setSelectLabel] = useState<string>('Select category');
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);

  const publishedProjects = [...projects]
    .filter((project) => project.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleFilterSelect = (categoryLabel: string) => {
    const normalized = categoryLabel.toLowerCase();
    setSelectedCategory(normalized);
    setSelectLabel(categoryLabel);
    setIsSelectOpen(false);
  };

  return (
    <article
      className={`portfolio${isActive ? ' active' : ''}`}
      data-page="portfolio"
    >
      <header>
        <h2 className="h2 article-title">{profile.portfolioHeading}</h2>
      </header>

      <section className="projects">
        <ul className="filter-list">
          {categories.map((category) => {
            const isCategoryActive =
              selectedCategory === category.toLowerCase();
            return (
              <li key={category} className="filter-item">
                <button
                  type="button"
                  className={isCategoryActive ? 'active' : undefined}
                  data-filter-btn
                  onClick={() => handleFilterSelect(category)}
                >
                  {category}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="filter-select-box">
          <button
            type="button"
            className={`filter-select${isSelectOpen ? ' active' : ''}`}
            data-select
            aria-expanded={isSelectOpen}
            onClick={() => setIsSelectOpen((prev) => !prev)}
          >
            <div className="select-value" data-selecct-value>
              {selectLabel}
            </div>

            <div className="select-icon">
              <IonIcon name="chevron-down" />
            </div>
          </button>

          <ul className="select-list">
            {categories.map((category) => (
              <li key={category} className="select-item">
                <button
                  type="button"
                  data-select-item
                  onClick={() => handleFilterSelect(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ul className="project-list">
          {publishedProjects.map((project) => {
            const matchesFilter =
              selectedCategory === 'all' ||
              project.filterCategory.toLowerCase() === selectedCategory;

            return (
              <li
                key={project.id}
                className={`project-item${matchesFilter ? ' active' : ''}`}
                data-filter-item
                data-category={project.filterCategory}
              >
                <a href={project.liveUrl}>
                  <figure className="project-img">
                    <div className="project-item-icon-box">
                      <IonIcon name="eye-outline" />
                    </div>

                    <img
                      src={project.thumbnailUrl}
                      alt={project.thumbnailAlt}
                      loading="lazy"
                    />
                  </figure>

                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-category">{project.category}</p>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
