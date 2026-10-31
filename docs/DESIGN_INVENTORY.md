# Design Inventory & Visual System Specification — Tamjid Portfolio V2

This document serves as the authoritative visual specification extracted from `index.html`, `assets/css/style.css`, and `assets/js/script.js`. Every public component in V2 must preserve these exact tokens, proportions, breakpoints, and interactive states.

---

## 1. Design Tokens (`:root` Custom Properties)

### 1.1 Original Dark Theme Color Palette (Default Theme)

| Token Name | Original Value | Visual Role |
| :--- | :--- | :--- |
| `--smoky-black` | `hsl(0, 0%, 7%)` (`#121212`) | Page `<body>` background & scrollbar track |
| `--eerie-black-2` | `hsl(240, 2%, 12%)` (`#1e1e1f`) | Primary surface background for `.sidebar`, `article`, `.testimonials-modal`, `.filter-select`, `.select-list` |
| `--eerie-black-1` | `hsl(240, 2%, 13%)` (`#202022`) | Inner fill (`::before`) for `.icon-box` and `.blog-post-item > a` |
| `--onyx` | `hsl(240, 1%, 17%)` (`#2b2b2c`) | Role badge (`.info-content .title`), modal close button, scrollbar track |
| `--jet` | `hsl(0, 0%, 22%)` (`#383838`) | 1px card borders, `.separator` lines, timeline vertical line, skill bar track, project hover icon box |
| `--white-1` | `hsl(0, 0%, 100%)` (`#ffffff`) | Role badge text |
| `--white-2` | `hsl(0, 0%, 98%)` (`#fafafa`) | Headings (`.h2`–`.h5`), sidebar name, contact values, form input text, project titles |
| `--light-gray` | `hsl(0, 0%, 84%)` (`#d6d6d6`) | Body copy (`.about-text`, `.service-item-text`, `.testimonials-text`, `.timeline-text`, `.blog-text`), inactive navbar links |
| `--light-gray-70` | `hsla(0, 0%, 84%, 0.7)` | Muted labels (`.contact-title`, `.project-category`, `.blog-meta`, social icons, modal date) |
| `--orange-yellow-crayola` | `hsl(45, 100%, 72%)` (`#ffdb70`) | Primary accent: icons, active nav link, active filter button, focus ring, text selection, hover titles |
| `--vegas-gold` | `hsl(45, 54%, 58%)` (`#ceb15a`) | Secondary accent: Resume timeline date ranges (`.timeline-list span`) |
| `--bittersweet-shimmer` | `hsl(0, 43%, 51%)` (`#b84c4c`) | Error state: invalid focused form inputs (`.form-input:focus:invalid`) |

### 1.2 Original Gradients

| Token Name | CSS Value | Usage |
| :--- | :--- | :--- |
| `--bg-gradient-onyx` | `linear-gradient(to bottom right, hsl(240, 1%, 25%) 3%, hsl(0, 0%, 19%) 97%)` | `.avatar-box`, `.testimonials-avatar-box`, `.modal-avatar-box` |
| `--bg-gradient-jet` | `linear-gradient(to bottom right, hsla(240, 1%, 18%, 0.251) 0%, hsla(240, 2%, 11%, 0) 100%), hsl(240, 2%, 13%)` | Inner card surface (`::before`) for `.content-card`, `.service-item`, `.info_more-btn`, `.form-btn` |
| `--bg-gradient-yellow-1` | `linear-gradient(to bottom right, hsl(45, 100%, 71%) 0%, hsla(36, 100%, 69%, 0) 50%)` | Hover outer border gradient for `.info_more-btn` and `.form-btn` |
| `--bg-gradient-yellow-2` | `linear-gradient(135deg, hsla(45, 100%, 71%, 0.251) 0%, hsla(35, 100%, 68%, 0) 59.86%), hsl(240, 2%, 13%)` | Hover inner fill (`::before`) for `.info_more-btn` and `.form-btn` |
| `--border-gradient-onyx` | `linear-gradient(to bottom right, hsl(0, 0%, 25%) 0%, hsla(0, 0%, 25%, 0) 50%)` | 1px directional border wrapper for `.icon-box`, `.content-card`, `.service-item`, `.blog-post-item > a`, `.info_more-btn`, `.form-btn` |
| `--text-gradient-yellow` | `linear-gradient(to right, hsl(45, 100%, 72%), hsl(35, 100%, 68%))` | `.article-title::after` underline bar, `.timeline-item::after` node dot, `.skill-progress-fill` bar |

### 1.3 Planned Light Mode Semantic Token Mapping (Phase 7)

To satisfy Section 9 (Dark by default + Light mode while preserving original color relationships and gold-accent identity):

| Token | Dark Mode (Default — Exact Original) | Light Mode (Harmonized Warm Ivory & Amber Gold) |
| :--- | :--- | :--- |
| `--smoky-black` (Page BG) | `hsl(0, 0%, 7%)` | `hsl(220, 16%, 94%)` (`#edeff3`) |
| `--eerie-black-2` (Container Surface) | `hsl(240, 2%, 12%)` | `hsl(0, 0%, 100%)` (`#ffffff`) |
| `--eerie-black-1` (Elevated Surface) | `hsl(240, 2%, 13%)` | `hsl(220, 14%, 97%)` (`#f6f7f9`) |
| `--onyx` (Badge / Pill Surface) | `hsl(240, 1%, 17%)` | `hsl(220, 14%, 91%)` (`#e4e7ec`) |
| `--jet` (Border / Divider) | `hsl(0, 0%, 22%)` | `hsl(220, 13%, 85%)` (`#d3d7de`) |
| `--white-1` (Badge Text) | `hsl(0, 0%, 100%)` | `hsl(240, 6%, 14%)` (`#222226`) |
| `--white-2` (Primary Heading Text) | `hsl(0, 0%, 98%)` | `hsl(240, 8%, 12%)` (`#1c1c21`) |
| `--light-gray` (Secondary Body Text) | `hsl(0, 0%, 84%)` | `hsl(240, 5%, 28%)` (`#44444b`) |
| `--light-gray-70` (Muted Text) | `hsla(0, 0%, 84%, 0.7)` | `hsla(240, 5%, 38%, 0.85)` (`#5c5c66`) |
| `--orange-yellow-crayola` (Primary Accent) | `hsl(45, 100%, 72%)` | `hsl(38, 92%, 42%)` (`#cd8409` — WCAG AA compliant gold on light surfaces) |
| `--vegas-gold` (Secondary Accent) | `hsl(45, 54%, 58%)` | `hsl(36, 78%, 36%)` (`#a36614`) |

---

## 2. Typography Scale & Shadows

### 2.1 Font Family & Weights
- **Font Family:** `--ff-poppins: 'Poppins', sans-serif;`
- **Weights:** `--fw-300: 300`, `--fw-400: 400`, `--fw-500: 500`, `--fw-600: 600`

### 2.2 Font Size Scale Across Breakpoints

| Token | Base (`<580px`) | `>=580px` | `>=768px` | Element Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--fs-1` | `24px` | `32px` | `32px` | `.h2` (`.article-title`) |
| `--fs-2` | `18px` | `24px` | `24px` | `.h3` (Section titles, modal title, blog card title) |
| `--fs-3` | `17px` | `26px` | `26px` | `.info-content .name` (Sidebar H1) |
| `--fs-4` | `16px` | `18px` | `18px` | `.h4` (Service title, testimonial title, timeline item title) |
| `--fs-5` | `15px` | `15px` | `15px` | `.project-title`, desktop `.filter-item button` |
| `--fs-6` | `14px` | `15px` | `15px` | Body text (`.about-text`, `.service-item-text`, `.timeline-list`, `.form-input`) |
| `--fs-7` | `13px` | `15px` (`14px` in `>=1250px` sidebar) | `15px` | `.h5` (Skill name), `.contact-link`, `<time>`, `<address>` |
| `--fs-8` | `11px` | `12px` | `12px` (`15px` on `.navbar-link`) | `.info-content .title`, `.contact-title`, `.info_more-btn span` |

### 2.3 Elevation Shadows & Transitions

| Token | Base (`<1024px`) | `>=1024px` |
| :--- | :--- | :--- |
| `--shadow-1` | `-4px 8px 24px hsla(0, 0%, 0%, 0.25)` | `-4px 8px 24px hsla(0, 0%, 0%, 0.125)` |
| `--shadow-2` | `0 16px 30px hsla(0, 0%, 0%, 0.25)` | `0 16px 30px hsla(0, 0%, 0%, 0.125)` |
| `--shadow-3` | `0 16px 40px hsla(0, 0%, 0%, 0.25)` | `0 16px 40px hsla(0, 0%, 0%, 0.125)` |
| `--shadow-4` | `0 25px 50px hsla(0, 0%, 0%, 0.15)` | `0 25px 50px hsla(0, 0%, 0%, 0.15)` |
| `--shadow-5` | `0 24px 80px hsla(0, 0%, 0%, 0.25)` | `0 24px 80px hsla(0, 0%, 0%, 0.25)` |
| `--transition-1` | `0.25s ease` | `0.25s ease` |
| `--transition-2` | `0.5s ease-in-out` | `0.5s ease-in-out` |

---

## 3. Responsive Breakpoint Architecture

| Breakpoint | Container Width (`.sidebar, article`) | Layout & Structural Changes |
| :--- | :--- | :--- |
| **Base (`<450px`)** | `auto` (`main` margin `15px 12px 75px`, min-width `259px`) | Sidebar collapsed (`max-height: 112px`, `active: 405px`), icon-only `chevron-down` button at top-right (`-15px`). Fixed bottom `.navbar`. 1-col grids. `.project-img` & `.blog-banner-box` fixed `height: 200px`. `.clients-item` `min-width: 50%`. |
| **`>=450px`** | `auto` | `.clients-item` `min-width: calc(33.33% - 10px)`. `.project-img` & `.blog-banner-box` `height: auto`. |
| **`>=580px`** | `520px` (`margin-inline: auto; padding: 30px`) | `main` margins `60px` top, `100px` bottom. Sidebar `max-height: 180px` (`active: 584px`), avatar `120px` (`border-radius: 30px`), `.info_more-btn` shows text `"Show Contacts"` instead of chevron icon. `.service-item` switches from centered column to left-aligned row (`display: flex; gap: 18px; padding: 30px`). Testimonial avatars `80px` offset `translate(30px, -30px)` with `margin-left: 95px` on title. Modal becomes horizontal flex with quote SVG visible. |
| **`>=768px`** | `700px` | `.contacts-list` becomes 2-column grid (`1fr 1fr`, `gap: 30px 15px`). Portfolio filter switches from dropdown `.filter-select-box` to horizontal `.filter-list` buttons. `.project-list`, `.blog-posts-list`, and Contact `.input-wrapper` become 2-column grids (`1fr 1fr`). Contact `.form-btn` becomes `width: max-content; margin-left: auto`. |
| **`>=1024px`** | `950px` (`box-shadow: var(--shadow-5)`) | `.navbar` moves from fixed bottom bar to `position: absolute; top: 0; right: 0; border-radius: 0 20px; width: max-content`. `.service-list` becomes 2-column grid (`1fr 1fr`). `.testimonials-item` shows 2 per view (`min-width: calc(50% - 15px)`). `.clients-item` shows 4 per view (`min-width: calc(25% - 38px)`). `.project-list` becomes 3-column grid (`repeat(3, 1fr)`). |
| **`>=1250px`** | `main` `max-width: 1200px; display: flex; gap: 25px` | Side-by-side desktop layout: `.sidebar` (`position: sticky; top: 60px; padding-top: 60px; height: 100%`) on left + `.main-content` (`width: 75%`) on right. Sidebar info becomes vertical column (`avatar 150px`, centered name & title, `.info_more-btn` hidden, `.sidebar-info_more` permanently visible, 1-column `.contacts-list` with ellipsis truncation, centered `.social-list`). |

---

## 4. Section-by-Section Component Inventory

| Section / Component | DOM Selector | Layout & Spacing | Interactive Behavior | Static vs Dynamic | Admin Editable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sidebar — Profile Header** | `aside.sidebar .sidebar-info` | Flex row (`<1250px`) / column (`>=1250px`), avatar (`80px` / `120px` / `150px`) in `--bg-gradient-onyx` rounded box, name H1, pill title badge | `.info_more-btn` toggles `.active` on `aside.sidebar` below `1250px` | Dynamic | Yes (Profile & Site Settings) |
| **Sidebar — Contacts & Socials** | `.sidebar-info_more` | `.separator` (`1px` `--jet`), `.contacts-list` with `.icon-box` + label/value pairs, `.social-list` icon row | `mailto:` and `tel:` links, external social links | Dynamic | Yes (Profile & Social Links) |
| **Navigation Bar** | `nav.navbar` | Fixed bottom (`<1024px`) or top-right corner (`>=1024px`), glassmorphic `hsla(240, 1%, 17%, 0.75)` + `backdrop-filter: blur(10px)` | Clicking `[data-nav-link]` switches active `<article data-page>` with `0.5s` fade and scrolls to top | Dynamic (labels, order, visibility) | Yes (Navigation Editor) |
| **About — Biography** | `article.about .about-text` | Paragraphs (`margin-bottom: 15px`, `--fs-6`, `--fw-300`, `line-height: 1.6`) below `.article-title` with gold `::after` bar | Static text display | Dynamic | Yes (About / Profile Editor) |
| **About — Services ("What i'm doing")** | `section.service` | 1-col (`<1024px`) / 2-col (`>=1024px`) grid of `.service-item` gradient-bordered cards (`padding: 20px`/`30px`, `border-radius: 14px`) | Static card display with 40px icon, H4 title, description | Dynamic | Yes (Services Manager) |
| **About — Testimonials & Modal** | `section.testimonials` + `.modal-container` | Horizontal scroll-snap list (`.has-scrollbar`) of `.content-card` items with floating `.testimonials-avatar-box` (`translate(15px/-25px)` or `(30px/-30px)`) | Clicking card opens `.modal-container.active` + `.overlay.active` with `scale(1.2 -> 1)` transition; close via button or overlay | Dynamic | Yes (Testimonials Manager) |
| **About — Clients** | `section.clients` | Horizontal scroll-snap strip of client logos (`.clients-item img`) | `filter: grayscale(1)` transitions to `grayscale(0)` on hover | Dynamic | Yes (Clients / Logos Manager) |
| **Resume — Education Timeline** | `article.resume section.timeline` (1st) | Header with `.icon-box` (`book-outline`) + H3; ordered list `.timeline-list` with 1px vertical `--jet` line and `6px`/`8px` gold node dots | Static vertical timeline | Dynamic | Yes (Education Manager) |
| **Resume — Experience Timeline** | `article.resume section.timeline` (2nd) | Identical timeline structure to Education (`book-outline` + H3 + `.timeline-list`) | Static vertical timeline | Dynamic | Yes (Experience Manager) |
| **Resume — Skills Progress Card** | `section.skill` | Single `.content-card` wrapper containing `.skills-item` rows (H5 skill name + `<data>` percentage + `8px` `.skill-progress-bg` / `.skill-progress-fill`) | Static progress bar fill (`style="width: X%"`) | Dynamic | Yes (Skills Manager) |
| **Portfolio — Filter & Project Grid** | `article.portfolio section.projects` | Filter buttons (`>=768px`) + custom select dropdown (`<768px`) + 1/2/3-col `.project-list` grid | Filtering toggles `.active` (`scaleUp 0.25s ease`); card hover scales image `1.1x`, darkens overlay (`hsla(0,0%,0%,0.5)`), reveals `.project-item-icon-box` (`eye-outline`) | Dynamic | Yes (Projects Manager) |
| **Blog — Posts Grid** | `article.blog section.blog-posts` | 1-col (`<768px`) / 2-col (`>=768px`) grid of `.blog-post-item` cards (`border-radius: 16px`, `200px`/`230px` banner, meta row with category + dot + date, H3 title, excerpt) | Hover scales banner image `1.1x` and turns `.blog-item-title` `--orange-yellow-crayola` | Dynamic | Yes (Blog / Articles Manager) |
| **Contact — Mapbox & Contact Form** | `article.contact` | `.mapbox` (`250px`/`380px` height, `border-radius: 16px`/`18px`, `grayscale(1) invert(1)` iframe) + `.contact-form` (`fullname`, `email`, `message`, `.form-btn`) | Form button disabled until inputs valid; submits message to backend API (storing inquiry in MongoDB + optional webhook/email notification) | Dynamic (map embed URL, form config, submissions) | Yes (Settings & Messages Inbox) |
