# CupGe Website Architecture

## Overview

CupGe is a static, scalable B2B manufacturing website for paper cups and packaging.

Current phase:

- HTML5
- CSS3
- Vanilla JavaScript
- JSON data files
- localStorage quote cart

Future data layer: Google Sheets through a Google Apps Script web app endpoint.

## Folder Structure

- `index.html` - page structure and content hooks
- `styles/` - modular CSS by website area
- `js/` - app logic, API abstraction, catalog, cart, video and social modules
- `data/products.json` - initial product catalog
- `data/social-links.json` - social media links
- `assets/images/logo/` - CupGe logo
- `assets/images/production/` - production visuals
- `docs/google-sheets-schema.md` - planned Sheets structure

## Catalog Architecture

Products are loaded through `getProducts()` in `js/api.js`.

For now, the function reads `data/products.json`. Later it can read from a Google Apps Script endpoint without changing the catalog UI.

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

1. Create a Google Sheet with `Products`, `Orders`, and `OrderItems` tabs.
2. Create a Google Apps Script web app attached to the Sheet.
3. Replace `getProducts()` with a read call to the Apps Script endpoint.
4. Replace `sendOrder()` with a POST request that appends rows to `Orders` and `OrderItems`.
5. Keep `localStorage` cart behavior on the frontend.

## YouTube and Social

YouTube behavior is isolated in `js/video.js`.

Social links are isolated in `data/social-links.json` and rendered through `js/social-links.js`.

## Scaling Recommendations

- Replace mock product visuals with real product photos.
- Keep product data in Google Sheets once the catalog grows.
- Add order status columns in Sheets for internal processing.
- Add form validation and spam protection before public launch.
- Add real Google Map embed and social media URLs.
