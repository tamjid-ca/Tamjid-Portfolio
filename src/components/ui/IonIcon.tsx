import React from 'react';
import type { IonIconName } from '@/types/portfolio';

interface IonIconProps {
  name: IonIconName;
  className?: string;
}

/**
 * Deterministic inline SVG implementation of Ionicons v5.5.2 icons used in the original portfolio.
 * Eliminates external unpkg.com script dependency while preserving exact stroke widths and viewBox geometry.
 */
export function IonIcon({ name, className }: IonIconProps) {
  const strokeWidth = 'var(--ionicon-stroke-width, 32px)';

  const renderPaths = () => {
    switch (name) {
      case 'chevron-down':
        return (
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M112 184l144 144 144-144"
          />
        );
      case 'mail-outline':
        return (
          <>
            <rect
              x="48"
              y="96"
              width="416"
              height="320"
              rx="40"
              ry="40"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              d="M112 160l144 112 144-112"
            />
          </>
        );
      case 'phone-portrait-outline':
        return (
          <>
            <rect
              x="128"
              y="16"
              width="256"
              height="480"
              rx="48"
              ry="48"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              d="M176 16h24a8 8 0 018 8v0a16 16 0 0016 16h64a16 16 0 0016-16v0a8 8 0 018-8h24"
            />
          </>
        );
      case 'calendar-outline':
        return (
          <>
            <rect
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              x="48"
              y="80"
              width="416"
              height="384"
              rx="48"
            />
            <circle cx="296" cy="232" r="24" fill="currentColor" />
            <circle cx="376" cy="232" r="24" fill="currentColor" />
            <circle cx="296" cy="312" r="24" fill="currentColor" />
            <circle cx="376" cy="312" r="24" fill="currentColor" />
            <circle cx="136" cy="312" r="24" fill="currentColor" />
            <circle cx="216" cy="312" r="24" fill="currentColor" />
            <circle cx="136" cy="392" r="24" fill="currentColor" />
            <circle cx="216" cy="392" r="24" fill="currentColor" />
            <circle cx="296" cy="392" r="24" fill="currentColor" />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              d="M128 48v32M384 48v32"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              d="M464 160H48"
            />
          </>
        );
      case 'location-outline':
        return (
          <>
            <path
              d="M256 48c-79.5 0-144 61.39-144 137 0 87 96 224.87 131.25 272.49a15.77 15.77 0 0025.5 0C304 409.89 400 272.07 400 185c0-75.61-64.5-137-144-137z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="256"
              cy="192"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
          </>
        );
      case 'logo-github':
        return (
          <path
            d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z"
            fill="currentColor"
          />
        );
      case 'logo-linkedin':
        return (
          <path
            d="M444.17 32H70.28C49.85 32 32 46.7 32 66.89v374.72C32 461.91 49.85 480 70.28 480h373.78c20.54 0 35.94-18.21 35.94-38.39V66.89C480.12 46.7 464.6 32 444.17 32zm-273.3 373.43h-64.18V205.88h64.18zM141 175.54h-.46c-20.54 0-33.84-15.29-33.84-34.43 0-19.49 13.65-34.42 34.65-34.42s33.85 14.82 34.31 34.42c-.01 19.14-13.31 34.43-34.66 34.43zm264.43 229.89h-64.18V296.32c0-26.14-9.34-44-32.56-44-17.74 0-28.24 12-32.91 23.69-1.75 4.2-2.22 9.92-2.22 15.76v113.66h-64.18V205.88h64.18v27.77c9.34-13.3 23.93-32.44 57.88-32.44 42.13 0 74 27.77 74 87.64z"
            fill="currentColor"
          />
        );
      case 'logo-facebook':
        return (
          <path
            d="M480 257.35c0-123.7-100.3-224-224-224s-224 100.3-224 224c0 111.8 81.9 204.47 189 221.29V322.12h-56.89v-64.77H221V208c0-56.13 33.45-87.16 84.61-87.16 24.51 0 50.15 4.38 50.15 4.38v55.13H327.5c-27.81 0-36.51 17.26-36.51 35v42h62.12l-9.92 64.77H291v156.54c107.1-16.81 189-109.48 189-221.31z"
            fillRule="evenodd"
            fill="currentColor"
          />
        );
      case 'close-outline':
        return (
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M368 368L144 144M368 144L144 368"
          />
        );
      case 'book-outline':
        return (
          <>
            <path
              d="M256 160c16-63.16 76.43-95.41 208-96a15.94 15.94 0 0116 16v288a16 16 0 01-16 16c-128 0-177.45 25.81-208 64-30.37-38-80-64-208-64-9.88 0-16-8.05-16-17.93V80a15.94 15.94 0 0116-16c131.57.59 192 32.84 208 96z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              d="M256 160v288"
            />
          </>
        );
      case 'eye-outline':
        return (
          <>
            <path
              d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="256"
              cy="256"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeMiterlimit="10"
              strokeWidth={strokeWidth}
            />
          </>
        );
      case 'paper-plane':
        return (
          <path
            d="M473 39.05a24 24 0 00-25.5-5.46L47.47 185h-.08a24 24 0 001 45.16l.41.13 137.3 58.63a16 16 0 0015.54-3.59L422 80a7.07 7.07 0 0110 10L226.66 310.26a16 16 0 00-3.59 15.54l58.65 137.38c.06.2.12.38.19.57 3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0023-15.46L478.39 64.62A24 24 0 00473 39.05z"
            fill="currentColor"
          />
        );
      case 'sunny-outline':
        return (
          <>
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth={strokeWidth}
              d="M256 48v48M256 416v48M403.08 108.92l-33.94 33.94M142.86 369.14l-33.94 33.94M464 256h-48M96 256H48M403.08 403.08l-33.94-33.94M142.86 142.86l-33.94-33.94"
            />
            <circle
              cx="256"
              cy="256"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth={strokeWidth}
            />
          </>
        );
      case 'moon-outline':
        return (
          <path
            d="M160 136c0-30.62 4.51-61.61 16-88C99.57 81.27 48 159.32 48 248c0 119.29 96.71 216 216 216 88.68 0 166.73-51.57 200-128-26.39 11.49-57.38 16-88 16-119.29 0-216-96.71-216-216z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  return (
    <span
      className={`ion-icon${className ? ` ${className}` : ''}`}
      data-ion-icon={name}
      aria-hidden="true"
    >
      <svg viewBox="0 0 512 512" className="ion-icon-svg">
        {renderPaths()}
      </svg>
    </span>
  );
}
