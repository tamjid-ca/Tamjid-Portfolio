# Initial Repository & Live Website Audit — Tamjid Portfolio V2

**Repository:** `https://github.com/tamjid-ca/Tamjid-Portfolio`  
**Live Website Reference:** `https://tamjid-portfolio.vercel.app/`  
**Starting Branch:** `main` (Commit `2da903fb089de501c39068d215f2ad941e1a6ba9`)  
**Target Branch:** `version2`  
**Audit Date:** 2026-10-30

---

## 1. Executive Summary

The existing **Tamjid Portfolio** is a single-page static HTML/CSS/Vanilla JS personal portfolio based on the `@codewithsadee` vCard Dark Portfolio layout, customized for **MD. Tamjid Hossain** ("IT enthusiast", Technology Explorer and Java & Python Practitioner from ALCA, Calgary, AB, Canada).

All content, styles, and interactive behaviors currently reside in three core source files (`index.html`, `assets/css/style.css`, and `assets/js/script.js`) along with four static image/SVG assets in `assets/images/`. There is no build pipeline, package manager manifest (`package.json`), backend server, database, or content management system in `main`.

---

## 2. Existing Directory Structure

```text
Tamjid-Portfolio/
├── .env                        # Local environment file (gitignored via *.env; defines MONGODB_URI)
├── .gitignore                  # Ignores *.env
├── README.md                   # Single heading: "# Tamjid-Portfolio"
├── index.html                  # Complete SPA markup (1,123 lines)
└── assets/
    ├── css/
    │   └── style.css           # Complete stylesheet & responsive media queries (1,882 lines)
    ├── images/
    │   ├── icon.svg            # Browser window / wireframe SVG used as site favicon (1024x1024 viewBox)
    │   ├── icon-design.svg     # Gold gradient design/pen-ruler SVG icon (42x42 viewBox, currently unused in HTML)
    │   ├── icon-quote.svg      # Gold gradient double-quote SVG icon (34x23 viewBox, used in testimonial modal)
    │   └── my-avatar.jpg       # 460x460 baseline JPEG photograph of MD. Tamjid Hossain (used as avatar and placeholder thumbnail)
    └── js/
        └── script.js           # Vanilla JS interactivity for sidebar, tabs, filter, modal, and contact form (211 lines)
```

---

## 3. Source File Technical Audit

### 3.1 `index.html` (1,123 lines)
- **Document Structure:** HTML5 `<main>` layout divided into two primary regions:
  1. `<aside class="sidebar" data-sidebar>`: Profile avatar, name (`MD. Tamjid Hossain`), badge (`IT enthusiast`), collapsible "Show Contacts" drawer (`data-sidebar-btn`), contact list (Email, Phone, Birthday, Location), and social icon links (GitHub, LinkedIn, Facebook).
  2. `<div class="main-content">`: Contains the top/bottom `<nav class="navbar">` and five tab-switched `<article data-page="...">` views:
     - `data-page="about"` (Default active tab): About narrative, "What i'm doing" services grid (4 cards), Testimonials horizontal snap-carousel (4 cards) + hidden Testimonials Modal (`data-modal-container`), and Clients horizontal logo strip (6 items).
     - `data-page="resume"`: Education timeline (3 `<li>` items, 1 populated for `ALCA`, 2 empty template rows), Experience timeline (3 `<li>` items with titles & dates, empty descriptions), and "My skills" progress bars (4 skills: Python, HTML, JavaScript, WordPress).
     - `data-page="portfolio"`: Category filter buttons (`All`, `Web design`, `Applications`, `Web development`), mobile custom select dropdown (`data-select`), and 9 project cards (`Finance`, `Orizon`, `Fundo`, `Brawlhalla`, `DSM.`, `MetaSpark`, `Summary`, `Task Manager`, `Arrival`).
     - `data-page="blog"`: 4 blog post cards in a 1-to-2 column grid.
     - `data-page="contact"`: Embedded Google Maps `<iframe>` pointing to Skyview Ranch, Calgary, AB, Canada, and a Contact Form (`fullname`, `email`, `message`, submit button).
- **Markup Defects & Quirks Identified in `index.html`:**
  1. **Duplicate closing `</p>` tag** at line 541 inside the Education timeline (`ALCA` entry).
  2. **Empty timeline items** in Education (lines 544–564 have two `<li class="timeline-item">` elements with empty `<h4>`, `<span>`, and `<p>` tags, which still render timeline dots on the page).
  3. **Mismatched skill percentage label vs. bar width** in Resume -> Skills (lines 639–644): JavaScript has `<data value="90">60%</data>` while `style="width: 90%"`.
  4. **Typo in Location text** (line 114): `<address>Canda</address>` ("Canda" instead of "Canada") and `<time datetime="1982-06-23">March 19, 2015</time>` (mismatched `datetime` attribute vs visible text).
  5. **Typo in data attribute** (line 691): `data-selecct-value` (double `c`), matched in `script.js` line 61.
  6. **Image reuse:** `./assets/images/my-avatar.jpg` is referenced for the profile avatar, all 4 service icons, all 4 testimonial avatars, all 6 client logos, all 9 project thumbnails, and all 4 blog banners (note: line 212 has a trailing newline inside the `src` attribute).

### 3.2 `assets/css/style.css` (1,882 lines)
- **Design System Architecture:** Pure CSS custom properties (`:root`) for HSL colors, multi-stop gradients, Poppins typography scale (`--fs-1` to `--fs-8`), font weights (`300`, `400`, `500`, `600`), elevation shadows (`--shadow-1` to `--shadow-5`), and transitions (`--transition-1`, `--transition-2`).
- **Card Border Technique:** Uses `position: relative; background: var(--border-gradient-onyx); z-index: 1;` paired with a `::before` pseudo-element (`inset: 1px; background: var(--bg-gradient-jet); z-index: -1;`) to render 1px directional gradient borders on `.icon-box`, `.content-card`, `.service-item`, `.info_more-btn`, `.blog-post-item > a`, and `.form-btn`.
- **CSS Typo Identified:** Line 554 sets `font-weight: var(--fw-3);` (undefined custom property; intended `var(--fw-300)`).
- **Responsive Breakpoints:** Mobile-first stylesheet with 5 `@media` min-width breakpoints:
  - `min-width: 450px`
  - `min-width: 580px`
  - `min-width: 768px`
  - `min-width: 1024px`
  - `min-width: 1250px`

### 3.3 `assets/js/script.js` (211 lines)
- **Sidebar Toggle (`lines 5–15`):** Toggles `.active` on `[data-sidebar]` when `[data-sidebar-btn]` is clicked (`max-height` expands from `112px`/`180px` to `405px`/`584px`).
- **Testimonials Modal (`lines 19–55`):** Clicking any `[data-testimonials-item]` copies its avatar `src`/`alt`, title `innerHTML`, and text `innerHTML` into `[data-modal-container]` and toggles `.active` on the modal and `[data-overlay]`. Note: `<time datetime="2021-06-14">14 June, 2021</time>` in the modal is hardcoded in HTML rather than read from individual testimonial items.
- **Portfolio Category Filter (`lines 58–114`):** Syncs mobile dropdown `[data-select]` and desktop button bar `[data-filter-btn]`, filtering `[data-filter-item]` cards by comparing `selectedValue` against `dataset.category` (`"all"`, `"web design"`, `"applications"`, `"web development"`).
- **Page Tab Navigation (`lines 139–159`):** Clicking any `[data-nav-link]` matches `this.innerHTML.toLowerCase()` against `pages[i].dataset.page`, toggles `.active` on the matching `<article>` and nav button, and calls `window.scrollTo(0, 0)`.
- **Contact Form (`lines 164–211`):** Validates `[data-form]` inputs on `input` event via `form.checkValidity()` to enable/disable `[data-form-btn]`. On `submit`, prevents default and attempts `fetch(scriptURL, { method: 'POST', body: new FormData(form) })`. Because `const scriptURL = "";` is empty, submitting posts to the current page URL (which fails on static hosting or resolves to `200 OK` GET/405 on static servers).

---

## 4. External Integrations & Assets

1. **Google Fonts:** `Poppins` (weights `300`, `400`, `500`, `600`) loaded from `https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap`.
2. **Ionicons v5.5.2:** Loaded via `<script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>` at the end of `<body>`. Used icons:
   - `chevron-down`
   - `mail-outline`
   - `phone-portrait-outline`
   - `calendar-outline`
   - `location-outline`
   - `logo-github`
   - `logo-linkedin`
   - `logo-facebook`
   - `close-outline`
   - `book-outline`
   - `eye-outline`
   - `paper-plane`
3. **Google Maps Embed:** `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10009.658163939283!2d-113.96869938501997!3d51.156146554192574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537163d907633bcd%3A0x18a143854b867573!2sSkyview%20Ranch%2C%20Calgary%2C%20AB%2C%20Canada!5e0!3m2!1sen!2sbd!4v1777137169843!5m2!1sen!2sbd` styled with `filter: grayscale(1) invert(1)` for dark mode.

---

## 5. Current SEO, Accessibility & Metadata Audit

- **Metadata:** Only `<title>MD. Tamjid Hossain</title>` and `<link rel="shortcut icon" href="./assets/images/icon.svg" type="image/x-icon" />` exist. Missing `<meta name="description">`, Open Graph (`og:*`), Twitter Cards, canonical URL, `robots.txt`, and `sitemap.xml`.
- **Accessibility Gaps:**
  - Social links (`logo-github`, `logo-linkedin`, `logo-facebook`) and modal close button (`close-outline`) have no `aria-label` or screen-reader text.
  - Testimonials cards are `<div>` elements with click listeners instead of keyboard-focusable `<button>` elements or `role="button" tabindex="0"`, and the modal lacks `role="dialog"`, `aria-modal="true"`, and `Escape` key closing.
  - Contact form inputs have `placeholder` attributes without associated `<label>` or `aria-label` attributes.
  - Skill `<data value="90">60%</data>` has a discrepancy between value and display label, and progress bars lack `role="progressbar"` / `aria-valuenow`.

---

## 6. Baseline Visual Reference Screenshots

Baseline screenshots of the original portfolio were captured via headless Chrome (`156.0.8078.76`) across all primary layout tiers and saved to `docs/screenshots/baseline/`:

- `docs/screenshots/baseline/baseline-desktop.png` (`1440x1200` — sticky left sidebar + 75% right main content + top-right navbar)
- `docs/screenshots/baseline/baseline-tablet.png` (`768x1200` — stacked 700px container + 2-column contact drawer + fixed bottom navbar)
- `docs/screenshots/baseline/baseline-mobile.png` (`500x1200` — compact stacked mobile card + collapsible sidebar + fixed bottom navbar)

---

## 7. Risks, Unknowns & Migration Dependencies

| ID | Category | Description | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **R-01** | **Visual Fidelity** | Tailwind CSS utility classes or CSS resets could subtly alter the exact 1px gradient borders (`::before` pseudo-elements), shadows, or 5 custom breakpoints (`450px`, `580px`, `768px`, `1024px`, `1250px`). | Preserve the exact custom properties and structural rules from `assets/css/style.css` inside modular/global CSS, augmented with semantic theme tokens for Light/Dark mode. |
| **R-02** | **Icon Parity** | Replacing Ionicons v5.5.2 with generic Lucide icons on the public site could alter stroke weight (`--ionicon-stroke-width`) and silhouette. | Render exact inline SVG equivalents matching Ionicons v5.5.2 paths/stroke widths for public portfolio icons, eliminating the external `unpkg.com` runtime script dependency while keeping 100% visual parity. Use Lucide React for the separate Admin CMS. |
| **R-03** | **Original Data Preservation** | The original HTML has both personalized data (Tamjid's bio, ALCA education, skills, contact info) and template placeholder items (empty Education rows, template Projects/Testimonials/Blog posts, "Canda" location, JS `90`/`60%` skill). | Seed MongoDB with the exact original content by default so V2 matches V1 out-of-the-box, while making every field, visibility flag, and display order editable from the Admin CMS. |
| **R-04** | **External Credentials** | `.env` currently contains only `MONGODB_URI`. Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) and Admin Auth (`ADMIN_SESSION_SECRET`, `ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD`) are not yet populated in `.env`. | Design strict environment validation with safe fallbacks/mock modes for local builds and automated tests when Cloudinary or external network access is unavailable, and document all required variables in `.env.example` and `context.md`. |
| **R-05** | **Sandbox & Filesystem Constraints** | The repository resides in `~/Downloads/Tamjid-Portfolio`, where macOS ACLs block shell file writes inside `sandbox-exec`. | Use native file tools (`write_file`, `edit_file`) for file authoring and minimal single-command `BypassSandbox: true` invocations only when running `npm`, `git`, or binary file operations. |
