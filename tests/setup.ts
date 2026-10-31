import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Poppins: () => ({
    className: 'poppins',
    variable: '--font-poppins',
  }),
}));

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
