'use client';

import React from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { NavigationItemDTO, PortfolioPageSlug } from '@/types/portfolio';

interface NavbarProps {
  navigationItems: NavigationItemDTO[];
  activePage: PortfolioPageSlug;
  onNavigate: (page: PortfolioPageSlug) => void;
}

export function Navbar({
  navigationItems,
  activePage,
  onNavigate,
}: NavbarProps) {
  const visibleItems = [...navigationItems]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <nav className="navbar" aria-label="Primary Portfolio Navigation">
      <ul className="navbar-list">
        {visibleItems.map((item) => {
          const isActive = activePage === item.slug;
          return (
            <li key={item.id} className="navbar-item">
              <button
                type="button"
                className={`navbar-link${isActive ? ' active' : ''}`}
                data-nav-link
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.slug)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
        <li className="navbar-item">
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}
