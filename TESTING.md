# Manual Testing Checklist

Run through this checklist after each deployment or major change. Tick each item before submitting for assessment.

## Setup

- [ ] `docker-compose up --build` completes without errors
- [ ] MySQL container shows as healthy (`docker-compose ps`)
- [ ] Django migrations ran successfully (check backend logs)
- [ ] `http://localhost` shows the BestProducts login page

---

## Authentication

### Register
- [ ] Navigate to `http://localhost/register`
- [ ] Submit form with valid username, email, and matching passwords → redirected to Dashboard
- [ ] Submit with mismatched passwords → error message shown, no redirect
- [ ] Submit with an already-taken username → error message shown

### Login
- [ ] Navigate to `http://localhost/login`
- [ ] Submit correct credentials → redirected to Dashboard, username shown in navbar
- [ ] Submit wrong password → "Invalid credentials" error shown
- [ ] Submit wrong username → "Invalid credentials" error shown (same message — no user enumeration)

### Session persistence
- [ ] After login, refresh the page → still logged in (token in localStorage)
- [ ] Click **Logout** → redirected to login page, token removed from localStorage

### Protected routes
- [ ] While logged out, navigate to `http://localhost/dashboard` → redirected to `/login`
- [ ] While logged out, navigate to `http://localhost/products` → redirected to `/login`

---

## Dashboard

- [ ] After login, Dashboard shows the correct username in the welcome message
- [ ] **Total Products** stat matches the actual count in the Products page
- [ ] **Total Stock Value** is calculated as `sum(price × stock)` for all products
- [ ] **Categories** shows the count of unique categories
- [ ] Clicking "Browse Products" navigates to `/products`
- [ ] Clicking "Import Products" navigates to `/import`

---

## Products — List & Search

- [ ] `/products` loads and shows all products as cards
- [ ] Each card shows: image (or placeholder), category, title, price, stock
- [ ] Typing in the search bar filters products by title (case-insensitive)
- [ ] Typing in the search bar filters products by category (case-insensitive)
- [ ] Clearing the search bar restores the full list
- [ ] If no products exist, an empty state message is shown

---

## Products — Create

- [ ] Click **+ Add Product** → modal opens with empty form
- [ ] Submit with title, price, and category filled → product appears in list, modal closes
- [ ] Submit with title missing → validation error shown, no submission
- [ ] Submit with price missing → validation error shown, no submission
- [ ] Cancel button closes the modal without creating a product

---

## Products — Edit & Delete

- [ ] On a product you own: **Edit** and **Delete** buttons are visible on the card
- [ ] On a product you do NOT own: Edit and Delete buttons are NOT visible
- [ ] Click **Edit** → modal opens pre-filled with the product's current values
- [ ] Change a field and save → product card updates with new values
- [ ] Click **Delete** → confirmation dialog appears
- [ ] Confirm delete → product removed from list
- [ ] Cancel delete → product remains

---

## Product Detail Page

- [ ] Clicking a product card navigates to `/products/:id`
- [ ] Full details are shown: image, title, category, price, description, stock, added-by, date
- [ ] For Fakestore-imported products: "Source: Fakestore API (#X)" is shown
- [ ] **Edit** button is shown only for own products
- [ ] **← Back to Products** navigates back to the list

---

## Fakestore Import

- [ ] Navigate to `/import`
- [ ] Page explains what Fakestore API is
- [ ] Click **Import from Fakestore API** → loading spinner appears
- [ ] On success: "X product(s) imported, Y already existed" message shown
- [ ] Imported products appear in the Products list
- [ ] Clicking import a second time → 0 imported, 20 skipped (no duplicates)
- [ ] If the Fakestore API is unreachable: error message shown (not a crash)

---

## API Endpoint Tests (use a browser or Postman)

- [ ] `GET /api/products/` without token → `401 Unauthorized`
- [ ] `POST /api/auth/login/` with correct credentials → `200 OK` with `access` and `refresh` tokens
- [ ] `GET /api/products/` with Bearer token → `200 OK` with product list
- [ ] `POST /api/products/` with token → `201 Created`
- [ ] `DELETE /api/products/{id}/` for a product you don't own → `403 Forbidden`
- [ ] `GET /api/auth/me/` with token → returns username and email

---

## Regression Checks

After any change, verify:
- [ ] Login still works
- [ ] Products list still loads
- [ ] Import still runs without duplicates
- [ ] No console errors in the browser developer tools
- [ ] Docker containers all show as running (`docker-compose ps`)
