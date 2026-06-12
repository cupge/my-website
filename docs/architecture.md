# CupGe Website Architecture

## Overview

CupGe is a static, scalable B2B manufacturing website for paper cups and packaging.

Current phase:

- HTML5
- CSS3
- Vanilla JavaScript
- JSON data files
- localStorage quote cart

CRM data layer: Google Sheets through a Google Apps Script web app endpoint.

## Folder Structure

- `index.html` - page structure and content hooks
- `styles/` - modular CSS by website area
- `js/` - app logic, API abstraction, catalog, cart, video and social modules
- `data/products.json` - initial product catalog
- `data/social-links.json` - social media links
- `assets/images/logo/` - CupGe logo
- `assets/images/production/` - production visuals
- `docs/google-sheets-schema.md` - CRM Sheets structure and deployment notes
- `docs/cupge-crm-apps-script.js` - Google Apps Script Web App code

## Catalog Architecture

Products are loaded through `getProducts()` in `js/api.js`.

For now, the function reads `data/products.json`. Order requests are sent to the CRM endpoint configured in `js/api.js`.

## Cart Logic

The quote cart stores product IDs and quantities in `localStorage` under `cupge-cart`.

Core functions:

- `addToCart(productId)`
- `removeFromCart(productId)`
- `updateCartQuantity(productId, quantity)`
- `getCart()`
- `clearCart()`

## Languages

The site supports Georgian as the default language, plus Russian and English. Translations live in `js/i18n.js`.

## Google Sheets Integration Strategy

1. Use the existing Google Sheet with `Leads` and `Products` tabs.
2. Deploy `docs/cupge-crm-apps-script.js` as a Google Apps Script web app.
3. Paste the deployed Web App URL into `CRM_ENDPOINT` in `js/api.js`.
4. `sendOrder()` posts customer and cart data to Apps Script.
5. Apps Script appends one lead row, one product row per cart item, creates `Settings` for `LastOrderNumber`, and emails `sales@cupge.com`.

## YouTube and Social

YouTube behavior is isolated in `js/video.js`.

Social links are isolated in `data/social-links.json` and rendered through `js/social-links.js`.

## Scaling Recommendations

- Replace mock product visuals with real product photos.
- Keep product data dynamic so new volumes and categories continue to work without CRM code changes.
- Add order status columns in Sheets for internal processing.
- Add form validation and spam protection before public launch.
- Add real Google Map embed and social media URLs.
