/**
 * List of common non-main content selectors
 * Used to configure which elements to remove during DOM cleaning.
 * @see RemovalOptions for configuration options
 *
 * This list is AI-optimized for LLM-friendly markdown extraction.
 * It aggressively removes navigation, search, sidebar, floating, modal, and other non-critical content.
 *
 * ---
 * Legacy and documentation-specific selectors are preserved below for full backward compatibility.
 */
export const excludeNonMainTags = [
  // Core structural elements
  'header',
  'footer',
  'nav',
  'aside',
  'style',

  // Search bars and forms
  'form[role="search"]',
  'form[action*="search"]',
  'form[class*="search" i]',
  'form[id*="search" i]',
  'form[aria-label*="search" i]',
  'input[type="search"]',
  'input[placeholder*="search" i]',
  'input[aria-label*="search" i]',
  'input[class*="search" i]',
  'input[id*="search" i]',
  'button[class*="search" i]',
  'button[id*="search" i]',
  'button[aria-label*="search" i]',
  'button[title*="search" i]',
  '[role="search"]',

  // Headers and navigation
  '.header',
  '.top',
  '.navbar',
  '#header',
  '#navbar',
  '.navigation',
  '#nav',
  '.menu',
  '#menu',
  '.breadcrumbs',
  '#breadcrumbs',
  '.visually-hidden',
  '[role="navigation"]',
  '[aria-label*="nav" i]',
  '[aria-label*="menu" i]',
  '[aria-label*="breadcrumb" i]',

  // Footers
  '.footer',
  '.bottom',
  '#footer',
  '[role="contentinfo"]',
  '[aria-label*="footer" i]',

  // Sidebars and asides
  '.sidebar',
  '#sidebar',
  '[class*="sidebar" i]',
  '[id*="sidebar" i]',
  '[role="complementary"]',
  '.aside',
  '#aside',
  '[class*="aside" i]',
  '[id*="aside" i]',

  // Popups, overlays, modals, dialogs, floating, sticky, banners
  '.modal',
  '.popup',
  '#modal',
  '.overlay',
  '.dialog',
  '.drawer',
  '.banner',
  '.sticky',
  '.float',
  '.fixed',
  '.toast',
  '.alert',
  '.announcement',
  '[class*="modal" i]',
  '[class*="popup" i]',
  '[class*="overlay" i]',
  '[class*="dialog" i]',
  '[class*="drawer" i]',
  '[class*="banner" i]',
  '[class*="sticky" i]',
  '[class*="float" i]',
  '[class*="fixed" i]',
  '[class*="toast" i]',
  '[class*="alert" i]',
  '[class*="announcement" i]',
  '[id*="modal" i]',
  '[id*="popup" i]',
  '[id*="overlay" i]',
  '[id*="dialog" i]',
  '[id*="drawer" i]',
  '[id*="banner" i]',
  '[id*="sticky" i]',
  '[id*="float" i]',
  '[id*="fixed" i]',
  '[id*="toast" i]',
  '[id*="alert" i]',
  '[id*="announcement" i]',
  '[role="dialog"]',
  '[role="alert"]',
  '[role="banner"]',
  '[aria-label*="modal" i]',
  '[aria-label*="popup" i]',
  '[aria-label*="dialog" i]',
  '[aria-label*="banner" i]',
  '[aria-label*="announcement" i]',

  // Ads, promotions, sponsors
  '.ad',
  '.ads',
  '.sponsor',
  '.promotion',
  '.promo',
  '[class*="ad" i]',
  '[class*="ads" i]',
  '[class*="sponsor" i]',
  '[class*="promo" i]',
  '[id*="ad" i]',
  '[id*="ads" i]',
  '[id*="sponsor" i]',
  '[id*="promo" i]',
  '[aria-label*="ad" i]',
  '[aria-label*="sponsor" i]',
  '[aria-label*="promo" i]',
  '.advert',
  '#ad',
  '.advertisement',

  // UI Components
  '.lang-selector',
  '.language',
  '#language-selector',
  '#search-form',
  '.search',
  '#search',
  '.widget',
  '#widget',
  '.theme-switcher',
  '.appearance',
  "[class*='theme-']",

  // Social and sharing
  '.social',
  '.social-media',
  '.social-links',
  '#social',
  '.share',
  '#share',

  // Notifications and banners
  '.notification',
  '.alert',
  '.banner',

  // Tab navigation (often contains duplicated content)
  "[role='tablist']",
  "[role='tab']",

  // Utility navigation
  '.utility-nav',
  '.meta-nav',
  '.secondary-nav',

  // Social sharing
  '.share',
  '.social',
  '.social-links',

  // Common interactive elements that aren't main content
  '.interactive',
  '.widget',
  '.tool',

  // Supplementary content
  '.supplementary',
  '.auxiliary',
  '.additional',

  // Documentation specific - only remove clearly non-essential UI
  "[class*='docSearch-']", // Search UI
  '.docs-toolbar', // Pure UI elements
  '.docs-edit-link', // Edit links
  '.theme-edit-this-page', // Edit buttons
  '.skip-link',
  '.skip-to-content',
  "[class*='skip-']",

  // Cookie banners, consent, newsletter, promo, announcement
  '.cookie',
  '.consent',
  '.newsletter',
  '.announcement',
  '[class*="cookie" i]',
  '[class*="consent" i]',
  '[class*="newsletter" i]',
  '[class*="announcement" i]',
  '[id*="cookie" i]',
  '[id*="consent" i]',
  '[id*="newsletter" i]',
  '[id*="announcement" i]',
  '[aria-label*="cookie" i]',
  '[aria-label*="consent" i]',
  '[aria-label*="newsletter" i]',
  '[aria-label*="announcement" i]',
  '#cookie',
  '.cookie-banner',
  "[class*='CookieConsent']",
  "[class*='turnstile']", // Cloudflare turnstile
  "[class*='prefetch']", // Resource prefetch links
  '.light-switch', // Theme switchers
  'script', // Remove script tags
  'noscript',

  // Pagination, pager, toolbar
  '.pagination',
  '.pager',
  '.toolbar',
  '[class*="pagination" i]',
  '[class*="pager" i]',
  '[class*="toolbar" i]',
  '[id*="pagination" i]',
  '[id*="pager" i]',
  '[id*="toolbar" i]',
  '[aria-label*="pagination" i]',
  '[aria-label*="pager" i]',
  '[aria-label*="toolbar" i]',

  // --- Documentation/TOC/Resource/Feedback blocks (for LLM-friendly output) ---
  '.on-this-page',
  '#on-this-page',
  '[aria-label*="on this page" i]',
  '.toc',
  '.table-of-contents',
  '#toc',
  '[aria-label*="table of contents" i]',
  'nav[class*="toc" i]',
  'nav[id*="toc" i]',
  'aside[class*="toc" i]',
  'aside[id*="toc" i]',
  'nav[class*="on-this-page" i]',
  'nav[id*="on-this-page" i]',
  'aside[class*="on-this-page" i]',
  'aside[id*="on-this-page" i]',
  '.footer-links',
  '.footer-nav',
  '.site-footer',
  '.footer-list',
  '[aria-label*="resources" i]',
  '[aria-label*="support" i]',
  '[aria-label*="company" i]',
  '[aria-label*="tools" i]',
  '[aria-label*="community" i]',
  'ul[class*="resources" i]',
  'ul[id*="resources" i]',
  'ul[class*="support" i]',
  'ul[id*="support" i]',
  'ul[class*="company" i]',
  'ul[id*="company" i]',
  'ul[class*="tools" i]',
  'ul[id*="tools" i]',
  'ul[class*="community" i]',
  'ul[id*="community" i]',
  'nav[class*="resources" i]',
  'nav[id*="resources" i]',
  'nav[class*="support" i]',
  'nav[id*="support" i]',
  'nav[class*="company" i]',
  'nav[id*="company" i]',
  'nav[class*="tools" i]',
  'nav[id*="tools" i]',
  'nav[class*="community" i]',
  'nav[id*="community" i]',
  '.was-this-helpful',
  '#was-this-helpful',
  '[aria-label*="was this helpful" i]',
  '.feedback',
  '.feedback-block',
  '[aria-label*="feedback" i]',
  // --- End documentation/TOC/resource/feedback blocks ---

  // --- Return to Top / Back to Top / Scroll to Top navigation ---
  'button[class*="top" i]',
  'button[id*="top" i]',
  'button[aria-label*="top" i]',
  'button[title*="top" i]',
  'a[class*="top" i]',
  'a[id*="top" i]',
  'a[aria-label*="top" i]',
  'a[title*="top" i]',
  '.return-to-top',
  '#return-to-top',
  '.back-to-top',
  '#back-to-top',
  '.scroll-to-top',
  '#scroll-to-top',
  '.go-to-top',
  '#go-to-top',
  '.totop',
  '#totop',
  // --- End Return to Top navigation ---
];
