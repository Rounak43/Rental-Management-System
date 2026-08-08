# RentSphere — Complete Software Documentation

> **Version:** 1.0.0 | **Stack:** MERN + Firebase | **Last Updated:** August 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Problem Statement](#3-problem-statement)
4. [Solution](#4-solution)
5. [Architecture](#5-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Frontend Folder Structure](#7-frontend-folder-structure)
8. [Backend Folder Structure](#8-backend-folder-structure)
9. [Database Schema](#9-database-schema)
10. [Authentication Flow](#10-authentication-flow)
11. [API Documentation](#11-api-documentation)
12. [Role-Based Access Control](#12-role-based-access-control-rbac)
13. [Customer Workflow](#13-customer-workflow)
14. [Vendor Workflow](#14-vendor-workflow)
15. [Admin Workflow](#15-admin-workflow)
16. [Data Flow](#16-data-flow)
17. [ER Diagram Explanation](#17-er-diagram-explanation)
18. [Feature List](#18-feature-list)
19. [Module Explanation](#19-module-explanation)
20. [Libraries Used](#20-libraries-used)
21. [External Services](#21-external-services)
22. [Current Project Status](#22-current-project-status)
23. [Known Issues](#23-known-issues)
24. [Future Scope](#24-future-scope)
25. [Development Roadmap](#25-development-roadmap)
26. [Installation Guide](#26-installation-guide)
27. [Environment Variables](#27-environment-variables)
28. [Deployment Guide](#28-deployment-guide)
29. [Testing Guide](#29-testing-guide)

---

## 1. Executive Summary

**RentSphere** is a full-stack, multi-role rental management platform connecting product owners (vendors) with customers who want to rent items. Built on the MERN stack (MongoDB, Express, React, Node.js) with Firebase authentication, it supports three roles: **Customer**, **Vendor (Partner)**, and **Admin**.

The platform handles the complete rental lifecycle: product listing, browsing, cart management, checkout, rental tracking, pickup/return confirmation, late fee calculation, and payment recording — all in a unified, role-aware interface.

---

## 2. Project Overview

| Property | Details |
|---|---|
| **Project Name** | RentSphere — Rental Management System |
| **Type** | Full-Stack Web Application |
| **Architecture** | Client-Server (SPA + REST API) |
| **Language** | JavaScript (ES Modules throughout) |
| **Frontend URL** | http://localhost:3000 |
| **Backend URL** | http://localhost:5000 |
| **Database** | MongoDB local (database: rental-system) |
| **Auth** | Firebase Authentication + Custom JWT |

### Project Goals
- Vendors list rental products; customers search, filter, and rent with date selection
- Admins have full operational control: users, rentals, inventory, analytics
- Automate late fee calculation and inventory management on return

---

## 3. Problem Statement

Traditional rental businesses operate with manual spreadsheets, phone bookings, and cash payments with no digital trail:

- No real-time product availability visibility
- No customer self-service portal
- No automated late fee calculation — disputes on return
- No unified vendor dashboard for tracking rentals and revenue
- No role separation between admins, vendors, and customers
- Not scalable beyond a small operation

---

## 4. Solution

| Problem | RentSphere Solution |
|---|---|
| Manual booking | Self-service checkout with cart + date picker |
| Inventory confusion | Real-time availableQuantity tracking, auto-decremented/restored |
| Late fee disputes | Auto-calculated: 1.5x daily rate per overdue day |
| No vendor dashboard | Dedicated partner portal: KPIs, orders, product management |
| No admin control | Unified dashboard: all users, all rentals, categories, analytics |
| Auth fragility | Dual-layer auth (Firebase + JWT) with Google SSO support |

---

## 5. Architecture

```
CLIENT (React + Vite) [port 3000]
  ┌──────────┐  ┌──────────┐  ┌───────────────┐
  │ Customer │  │  Vendor  │  │     Admin     │
  │  Portal  │  │  Portal  │  │   Dashboard   │
  └────┬─────┘  └────┬─────┘  └──────┬────────┘
       └──────────────┴───────────────┘
                      │
          React Router v6 (SPA routing)
                      │
      Context API (Auth, Cart, Theme, Toast)
                      │
         Services Layer (Axios + api.js)
                      │ HTTP/REST
                      ▼
SERVER (Express + Node.js) [port 5000]
  Route Layer /api/*
       │
  Auth Middleware (JWT verify + role guard)
       │
  Controller Layer (business logic)
       │
  Mongoose ODM ──→ MongoDB
  Firebase Admin SDK (token verification)
       │
       ▼
  Firebase Auth (Google SSO, Email/Password, Email Verification)
```

### Key Architectural Decisions

- **Dual Authentication**: Firebase handles identity, JWT handles API authorization. Independent layers — Firebase failure does not break existing sessions.
- **Lazy Loading**: Heavy pages (dashboards, checkout) use React.lazy() + Suspense for smaller initial bundle.
- **Role Guards**: Client-side PrivateRoute AND server-side middleware both enforce RBAC (defense in depth).
- **One cart per user**: Cart.user has a unique DB index enforced at database level.

---

## 6. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| Vite | 5.2.0 | Build tool and dev server |
| React Router DOM | 6.22.3 | Client-side routing |
| Axios | 1.6.8 | HTTP client with interceptors |
| Firebase Client SDK | 12.17.1 | Google SSO, email/password auth, verification |
| Lucide React | 0.368.0 | SVG icon library |
| Vanilla CSS | — | All styling (no CSS frameworks) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | JavaScript runtime |
| Express.js | 4.19.2 | HTTP server and routing |
| Mongoose | 8.3.1 | MongoDB ODM |
| MongoDB | local | NoSQL database |
| firebase-admin | 14.2.0 | Server-side Firebase token verification |
| jsonwebtoken | 9.0.2 | JWT generate and verify |
| bcryptjs | 2.4.3 | Password hashing |
| multer | 1.4.5-lts | File upload middleware |
| dotenv | 16.4.5 | Environment variable loading |
| nodemon | 3.1.0 | Dev auto-restart |
| cors | 2.8.5 | Cross-Origin Resource Sharing |

---

## 7. Frontend Folder Structure

```
client/src/
├── App.jsx                      # Router + context providers + PrivateRoute guard
├── main.jsx                     # React DOM root
├── config/
│   └── firebase.js              # Firebase client init + exported auth functions
├── context/
│   ├── AuthContext.jsx          # Auth state: user, jwt, role, loading + all auth functions
│   ├── CartContext.jsx          # Cart state + API sync
│   ├── ThemeContext.jsx         # Light/dark toggle, persisted to localStorage
│   └── ToastContext.jsx         # Global toast notification system
├── components/
│   ├── common/                  # Loader, shared UI components
│   ├── layout/                  # Navbar, Footer
│   ├── product/                 # ProductConfigModal
│   └── protected/               # ProtectedRoute component
├── services/
│   ├── api.js                   # Axios instance with JWT interceptor + error standardization
│   ├── authService.js           # login, register, googleAuth API calls
│   ├── cartService.js           # Cart API calls
│   ├── categoryService.js       # Category API calls
│   ├── paymentService.js        # Payment API calls
│   ├── productService.js        # Product API calls
│   ├── profileService.js        # Profile update calls
│   ├── rentalService.js         # Rental API calls
│   ├── userService.js           # User management calls
│   ├── vendorService.js         # Vendor profile calls
│   └── wishlistService.js       # Wishlist API calls
├── hooks/                       # Custom React hooks
├── layouts/                     # Page layout wrappers
└── pages/
    ├── Landing.jsx              # Public landing page
    ├── ChooseAccount.jsx        # Customer vs Vendor selection
    ├── Auth/
    │   ├── Login.jsx            # Customer login
    │   ├── Register.jsx         # Customer registration
    │   ├── PartnerLogin.jsx     # Vendor login/signup
    │   ├── ForgotPassword.jsx   # Password reset request
    │   ├── VerifyEmail.jsx      # Email verification prompt
    │   ├── CompleteProfile.jsx  # Post-Google phone collection
    │   └── signup.jsx           # Extended signup form
    ├── customer/
    │   ├── CustomerDashboard.jsx  # Stats: total/active/pending rentals
    │   ├── ProductBrowse.jsx      # Browse + filter + paginate catalog
    │   ├── ProductDetails.jsx     # Full product detail view
    │   ├── Cart.jsx               # Cart with dates and totals
    │   ├── CheckoutFlow.jsx       # Multi-step checkout
    │   ├── PaymentSuccess.jsx     # Confirmation page
    │   ├── Orders.jsx             # My rentals + status tracking
    │   ├── Wishlist.jsx           # Saved products
    │   └── CustomerSettings.jsx   # Profile + address management
    ├── partner/
    │   ├── PartnerDashboard.jsx   # Vendor KPIs: products, orders, revenue
    │   ├── PartnerProducts.jsx    # Product CRUD UI
    │   ├── PartnerOrders.jsx      # Rental orders on own products
    │   └── VendorSettings.jsx     # Vendor profile settings
    └── admin/
        ├── AdminDashboard.jsx     # Unified admin panel
        └── [stub pages]           # CategoryManagement, ProductManagement, etc.
```

---

## 8. Backend Folder Structure

```
server/
├── server.js                    # Express entry point
├── config/
│   ├── db.js                    # MongoDB connection via Mongoose
│   └── firebaseAdmin.js         # Firebase Admin SDK initialization
├── controllers/
│   ├── authController.js        # register, login, getMe, googleAuth
│   ├── productController.js     # Full product CRUD
│   ├── categoryController.js    # Category CRUD
│   ├── rentalController.js      # Full rental lifecycle management
│   ├── paymentController.js     # Payment recording
│   ├── userController.js        # Profile + admin user management
│   └── vendorController.js      # Vendor profile operations
├── middleware/
│   ├── authMiddleware.js        # protect, admin, vendor route guards
│   ├── errorMiddleware.js       # Centralized error handler
│   └── uploadMiddleware.js      # Multer file upload config
├── models/
│   ├── User.js                  # User schema
│   ├── VendorProfile.js         # Vendor business profile (1:1 with User)
│   ├── Product.js               # Product listings
│   ├── Category.js              # Product categories (self-referential)
│   ├── Rental.js                # Rental bookings
│   ├── Cart.js                  # Shopping carts (1:1 with User)
│   ├── Wishlist.js              # Wishlists (1:1 with User)
│   ├── Payment.js               # Payment transactions
│   └── Address.js               # Saved delivery addresses (1:N with User)
├── routes/
│   ├── index.js                 # Master router mounting all sub-routers
│   ├── authRoutes.js            # /api/auth
│   ├── productRoutes.js         # /api/products
│   ├── categoryRoutes.js        # /api/categories
│   ├── rentalRoutes.js          # /api/rentals
│   ├── paymentRoutes.js         # /api/payments
│   ├── userRoutes.js            # /api/users
│   └── vendorRoutes.js          # /api/vendor
├── utils/
│   └── helpers.js               # generateToken(), calculateLateFee()
├── scripts/                     # Seed / maintenance scripts
└── uploads/                     # Multer file storage directory
```

---

## 9. Database Schema

### 9.1 User — Collection: users

| Field | Type | Notes |
|---|---|---|
| name | String | Required, trimmed |
| email | String | Required, unique, indexed, lowercase — toJSON strips password |
| password | String | Optional (null for Google users) |
| role | String | customer / admin / vendor — Default: customer |
| phone | String | Collected on profile completion |
| profileImage | String | URL |
| isVerified | Boolean | Default: false |
| firebaseUid | String | Indexed; set for Firebase users |
| authProvider | String | local / google — Default: local |
| emailVerified | Boolean | Default: false |
| isActive | Boolean | Default: true (soft-delete flag) |
| lastLogin | Date | Updated on Google auth |
| address | Object | Embedded: street, city, state, zipCode, country |
| createdAt / updatedAt | Date | Mongoose timestamps |

### 9.2 VendorProfile — Collection: vendorprofiles

| Field | Type | Notes |
|---|---|---|
| user | ObjectId | Ref: User — unique (1-to-1 relationship) |
| companyName | String | Required |
| ownerName | String | Required |
| gst | String | GST/Tax number |
| rentalCategory | String | Primary business category |
| businessAddress | Object | Embedded: street, city, state, zipCode, country |

### 9.3 Product — Collection: products

| Field | Type | Notes |
|---|---|---|
| title | String | Required — text-indexed for search |
| description | String | Required |
| owner | ObjectId | Ref: User (vendor) — required |
| category | ObjectId | Ref: Category — required |
| images | [String] | Array of image URLs |
| brand | String | Text-indexed |
| model | String | Text-indexed |
| condition | String | Required: new / like-new / good / fair |
| location | String | Required — regex-searchable |
| quantity | Number | Total stock |
| availableQuantity | Number | Auto-managed: decremented on rental, restored on return |
| pricePerHour | Number | Default: 0 |
| pricePerDay | Number | Required — primary pricing unit |
| pricePerWeek | Number | Default: 0 |
| pricePerMonth | Number | Default: 0 |
| securityDeposit | Number | Required at checkout |
| lateFee | Number | Per-day overdue fee config |
| availability | Boolean | Auto: false when availableQuantity hits 0 |
| specifications | Mixed | Flexible JSON for product-specific specs |
| rating | Number | 0-5 average |
| reviewCount | Number | Default: 0 |
| status | String | available / rented / maintenance / retired |
| isPublished | Boolean | Default: false — only published shown publicly |

**Indexes**: { title, brand, model } text index; { category }, { owner } standard indexes.

### 9.4 Category — Collection: categories

| Field | Type | Notes |
|---|---|---|
| name | String | Unique |
| slug | String | Unique, lowercase, indexed |
| description | String | |
| image | String | URL |
| icon | String | Icon class or URL |
| isActive | Boolean | Default: true |
| parentCategory | ObjectId | Self-ref for sub-categories |

### 9.5 Rental — Collection: rentals

| Field | Type | Notes |
|---|---|---|
| user | ObjectId | Ref: User |
| product | ObjectId | Ref: Product |
| rentStartDate | Date | Required |
| rentEndDate | Date | Required |
| actualReturnDate | Date | Set when returned |
| totalCost | Number | days × pricePerDay |
| securityDepositPaid | Number | Snapshot at booking time |
| status | String | pending → active → returned / overdue / cancelled |
| pickupStatus | String | pending / picked_up |
| returnStatus | String | pending / returned |
| lateFee | Number | Auto-calculated: 1.5× daily rate × overdue days |

### 9.6 Cart — Collection: carts

One cart per user (unique index on Cart.user).

CartItem sub-document: { product (Ref), quantity (min:1), rentalStart (Date), rentalEnd (Date) }

Pre-validate hook: rentalEnd must be after rentalStart.

### 9.7 Wishlist — Collection: wishlists

One wishlist per user (unique index). Pre-save hook auto-removes duplicate product ObjectIds.

### 9.8 Payment — Collection: payments

| Field | Type | Notes |
|---|---|---|
| rental | ObjectId | Ref: Rental |
| user | ObjectId | Ref: User |
| amount | Number | |
| paymentMethod | String | e.g., card, upi |
| status | String | pending / completed / failed / refunded |
| transactionId | String | Unique |
| type | String | rental_payment / deposit_refund / late_fee_charge |

### 9.9 Address — Collection: addresses

Multiple addresses per user. Pre-save hook auto-unsets isDefault on other addresses when one is set as default.

Fields: user (ObjectId ref), fullName, phone, street, city, state, zipCode, country, isDefault.

---

## 10. Authentication Flow

RentSphere uses dual-layer authentication:

**Layer 1 — Firebase Auth (Identity):** Google SSO, Email/Password, Email Verification, Password Reset. Outputs Firebase UID + short-lived ID Token.

**Layer 2 — Backend JWT (API Authorization):** Custom JWT, 30-day expiry, stored in localStorage as "token".

### Flow 1: Email/Password Registration
1. User fills form (name, email, password, phone)
2. Client: Firebase createUserWithEmailAndPassword() → account created + verification email sent
3. Client: POST /api/auth/register → User + VendorProfile (if vendor) created in MongoDB
4. Backend returns JWT + user object
5. Stored in localStorage → redirected to dashboard

### Flow 2: Email/Password Login
1. Client: Firebase signInWithEmailAndPassword() → Firebase session
2. Client: POST /api/auth/login → bcrypt.compare() password validation
3. Role check: vendor login requires role=vendor
4. Returns JWT + user → stored in localStorage

### Flow 3: Google SSO
1. Client: signInWithPopup(googleProvider) → Firebase authenticates, returns googleUser
2. Client: googleUser.getIdToken() → Firebase ID Token
3. Client: POST /api/auth/google { idToken }
4. Server: getAuth().verifyIdToken(idToken) → decode claims
5. UPSERT: New user → User.create() | Existing → update firebaseUid, authProvider, lastLogin
6. Server generates JWT → returns user + token → stored in localStorage

### Flow 4: Session Restore on App Load
1. App mounts → onAuthStateChanged() fires → sets firebaseUser
2. Read token from localStorage
3. GET /api/auth/me with Bearer token
4. Valid: user state updated from backend | 401: localStorage cleared (stale session purged)

### Post-Google Profile Completion
If user.phone is missing → PrivateRoute redirects to /complete-profile
CompleteProfile.jsx collects phone (and company info for vendors)
After save → user can access protected routes

---

## 11. API Documentation

**Base URL:** http://localhost:5000/api
**Auth Header:** Authorization: Bearer <jwt_token>

### Auth Routes — /api/auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /register | Public | Register new user (customer or vendor) |
| POST | /login | Public | Email/password login |
| POST | /google | Public | Google OAuth via Firebase ID Token |
| GET | /me | Private | Get current user profile |

**POST /register body:** { name, email, password, phone, role, companyName, ownerName, gst, rentalCategory, businessAddress }
**Response 201:** { token, _id, name, email, role, phone, vendorProfile }

**POST /google body:** { idToken: "<firebase_id_token>" }
**Response 200:** { success, token, user: { _id, name, email, role, ... } }

### Products — /api/products

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | / | Public | Get published products (filters + pagination) |
| GET | /:id | Public | Get single product |
| GET | /vendor/my-products | Vendor | Get own products |
| POST | / | Vendor | Create product |
| PUT | /:id | Vendor | Update own product |
| DELETE | /:id | Vendor | Delete own product |

**GET / query params:** category, search, availability, condition, minPrice, maxPrice, location, page (default:1), limit (default:12)
**Response:** { products: [...], currentPage, totalPages, total }

### Categories — /api/categories

| Method | Endpoint | Access |
|---|---|---|
| GET | / | Public |
| POST | / | Admin |
| PUT | /:id | Admin |
| DELETE | /:id | Admin |

### Rentals — /api/rentals

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | / | Customer | Create rental booking |
| GET | /my-rentals | Customer | Own rentals |
| GET | /vendor-rentals | Vendor | Rentals on own products |
| GET | / | Admin | All rentals |
| PATCH | /:id/pickup | Admin | Mark picked up → status: active |
| PATCH | /:id/return | Admin | Mark returned → auto late fee calculation |
| GET | /reports/analytics | Admin | { total, active, pending, returned, revenue } |

**POST / body:** { product: "<id>", rentStartDate: "2026-08-10", rentEndDate: "2026-08-15" }
**Server auto-calculates:** totalCost = days × pricePerDay, securityDepositPaid, decrements availableQuantity

### Users — /api/users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| PUT | /profile | Private | Update own profile |
| GET | / | Admin | Get all users |
| DELETE | /:id | Private | Delete account |
| DELETE | /bulk/delete-all | Admin | Bulk delete all customer/vendor accounts |

---

## 12. Role-Based Access Control (RBAC)

### Roles
- **customer**: browse, cart, wishlist, checkout, own orders
- **vendor**: customer permissions + own product management + own rental orders
- **admin**: all permissions + all users, all rentals, categories, analytics

### Server Middleware Guards (authMiddleware.js)
- **protect**: jwt.verify() → User.findById() → req.user
- **admin**: req.user.role === 'admin'
- **vendor**: req.user.role === 'vendor' OR 'admin'

### Client Guard (PrivateRoute in App.jsx)
- No user → redirect to /login
- user.phone missing → redirect to /complete-profile
- Wrong role → redirect to role-appropriate dashboard

### Route Access Matrix

| Route | Customer | Vendor | Admin |
|---|---|---|---|
| / /products /products/:id /cart /wishlist | YES | YES | YES |
| /dashboard /checkout /orders /settings | YES | NO | YES |
| /partner/dashboard /partner/products /partner/orders /partner/settings | NO | YES | YES |
| /admin/dashboard | NO | NO | YES |

---

## 13. Customer Workflow

**1. DISCOVERY:** Landing page (/) → categories, hero section, marketing content

**2. BROWSE:** /products → filter (category, condition, location, price range) + text search (title, brand, model) + paginated results (12/page)

**3. PRODUCT DETAIL:** /products/:id → images, specs, pricing tiers (hr/day/week/month), security deposit, availability → Add to Cart (date picker) or Add to Wishlist

**4. CART:** /cart → view items with rental dates, update quantities, remove items, see total cost

**5. CHECKOUT:** /checkout (multi-step)
- Step 1: Select or add delivery address
- Step 2: Review order summary
- Step 3: Choose payment method
- Step 4: Confirm → rental created → /payment-success

**6. ORDERS:** /orders → all rentals with status (pending → active → returned), dates, total cost, late fee

**7. ACCOUNT:** /dashboard (stats) | /settings (profile, addresses, password change)

---

## 14. Vendor Workflow

**1. REGISTRATION:** /choose-account → "I want to rent out items" → /register (role=vendor) or /partner/login
Enter: company name, owner name, GST, category → VendorProfile auto-created

**2. DASHBOARD:** /partner/dashboard → KPIs (total products, active rentals, revenue) + recent orders

**3. PRODUCT MANAGEMENT:** /partner/products
- Create: title, desc, category, condition, pricing tiers, deposit, late fee, stock quantity
- Publish/Unpublish toggle per product
- Edit and delete own products

**4. ORDER MANAGEMENT:** /partner/orders → rentals on own products, customer info (name, email, phone), dates, status, total cost

**5. SETTINGS:** /partner/settings → company info, business address, GST, rental category

---

## 15. Admin Workflow

**1. LOGIN:** Any login page with admin credentials → redirected to /admin/dashboard

**2. PLATFORM STATS:** Users (total/vendors/customers), products, categories, rentals (total/active/pending/returned), total revenue

**3. USER MANAGEMENT:** View all users (role, email, status), delete individual, bulk delete all customer/vendor accounts

**4. RENTAL MANAGEMENT:**
- View all rentals across all vendors
- Mark "Picked Up" → status: active
- Mark "Returned" → auto late fee: overdueDays × (pricePerDay × 1.5)

**5. CATEGORY MANAGEMENT:** Create, edit, delete, toggle active status

**6. PRODUCT MANAGEMENT:** View all products across all vendors, delete any product

**7. ANALYTICS:** GET /api/rentals/reports/analytics → { total, active, pending, returned, revenue }

---

## 16. Data Flow

### Rental Booking Flow
```
Customer submits checkout
  ↓
POST /api/rentals { product, rentStartDate, rentEndDate }
  ↓ Validate: product.availableQuantity > 0
  ↓ Calculate: days = ceil((endDate - startDate) / 86400000)
  ↓ Calculate: totalCost = days × pricePerDay
  ↓ Create Rental document (status: pending)
  ↓ Product.availableQuantity-- (if 0 → availability: false)
  ↓
/payment-success
```

### Return Processing Flow
```
Admin: PATCH /api/rentals/:id/return
  ↓ Find Rental (populate Product)
  ↓ actualReturnDate = now()
  ↓ if now() > rentEndDate:
      overdueDays = ceil((now - endDate) / 86400000)
      lateFee = overdueDays × (pricePerDay × 1.5)
  ↓ rental.status = returned | rental.save()
  ↓ Product.availableQuantity++ | Product.availability = true
```

### API Request Pipeline
```
Client action
  → api.js request interceptor:
      Read token from localStorage
      Add Authorization: Bearer <token>
      DEV log: method + URL + payload
  → Express: CORS → body-parser → route match
  → authMiddleware.protect: jwt.verify() → User.findById() → req.user
  → Role guard (admin/vendor) if applicable
  → Controller: Mongoose query → MongoDB
  → Response
  → api.js response interceptor:
      DEV log: status + data
      Error: extract message + status code
```

---

## 17. ER Diagram Explanation

```
USER (1) ────────── (1) VENDORPROFILE
USER (1) ────────── (N) RENTAL ─── (N:1) PRODUCT
USER (1) ────────── (1) CART ─── [CART_ITEMS] ─── PRODUCT
USER (1) ────────── (1) WISHLIST ─── [PRODUCTS]
USER (1) ────────── (N) ADDRESS
PRODUCT (N) ─────── (1) CATEGORY (self-ref for sub-categories)
PRODUCT (N) ─────── (1) USER [owner = vendor]
RENTAL (1) ─────── (1) PAYMENT
```

### Relationship Table

| Relationship | Type | Enforcement |
|---|---|---|
| User → VendorProfile | 1:1 | unique index on VendorProfile.user |
| User → Cart | 1:1 | unique index on Cart.user |
| User → Wishlist | 1:1 | unique index on Wishlist.user |
| User → Address | 1:N | multiple; isDefault managed by pre-save hook |
| User → Rental | 1:N | no constraint |
| Product → Category | N:1 | required ObjectId ref |
| Product → User (owner) | N:1 | required ObjectId ref |
| Rental → Product | N:1 | required ObjectId ref |
| Rental → Payment | 1:1 | one payment per rental |
| Category → Category | Self-ref | parentCategory for sub-categories |

---

## 18. Feature List

### Currently Implemented

**Authentication and Users**
- Email/password registration and login
- Google OAuth via Firebase popup
- Firebase email verification sent on signup
- Password reset via Firebase email
- JWT-based API session (30-day expiry)
- Session persistence with stale token auto-cleanup
- Post-Google profile completion (phone collection)
- Role-based routing (Customer / Vendor / Admin)

**Customer Features**
- Product catalog with filtering (category, condition, price, location, availability)
- Text search across title, brand, model
- Paginated listing (12 per page)
- Product detail page with full specs and pricing tiers
- Cart with per-item rental date selection (start + end)
- Multi-step checkout flow
- Payment success confirmation page
- Order history with status tracking
- Wishlist (add/remove, no duplicates enforced by DB)
- Profile and address settings

**Vendor Features**
- Separate vendor registration and login portal
- Vendor dashboard with KPIs
- Full product CRUD
- Multiple pricing tiers (hourly/daily/weekly/monthly)
- Security deposit and late fee configuration per product
- Publish/Unpublish toggle
- Rental orders view filtered to own products
- Vendor profile and business settings

**Admin Features**
- Unified admin dashboard
- Platform-wide statistics and analytics
- All users management (view, delete, bulk delete)
- All rentals management (view, pickup confirmation, return confirmation)
- Auto late fee calculation (1.5× daily rate × overdue days)
- Inventory auto-management (availableQuantity decremented/restored)
- Category CRUD

**Infrastructure**
- Dual-layer auth (Firebase + JWT)
- Centralized error handling middleware
- File upload support via Multer
- CORS enabled
- Static file serving for uploads
- Dev request/response logging via Axios interceptors

### Not Yet Implemented

| Feature | Status |
|---|---|
| Real payment gateway (Razorpay/Stripe) | Not started |
| Product image upload wired to UI | Multer ready; UI pending |
| Product reviews and ratings | Schema fields ready; no endpoints |
| Email notifications | Not started |
| Admin sub-pages (stubs exist) | Minimal content |
| JWT refresh token | Not started |

---

## 19. Module Explanation

### Frontend

**AuthContext.jsx** — Central auth state. Provides: user, jwt, role, loading, isVerified. Functions: loginWithEmail, signupWithEmail, loginWithGoogle, logout, resetPassword, changePassword, deleteAccount, resendVerificationEmail. Session restore via onAuthStateChanged + GET /api/auth/me on mount.

**CartContext.jsx** — Cart state synced with backend /api/cart. Provides: cartItems, addToCart, removeFromCart, updateQuantity, clearCart.

**ThemeContext.jsx** — theme (light/dark), toggleTheme(). Persists to localStorage.

**ToastContext.jsx** — Global notification: showToast(message, type). success/error/info types.

**api.js** — Axios instance: baseURL from VITE_API_BASE_URL, auto-attaches JWT, standardizes error responses with status codes. DEV logging enabled automatically.

**services/*.js** — One file per API domain. All use the shared api.js instance. Abstracts HTTP from components.

### Backend

**authController.js:**
- register: User.create() + optional VendorProfile.create(), returns JWT
- login: bcrypt.compare() + role check, returns JWT
- getMe: returns req.user (set by protect middleware)
- googleAuth: getAuth().verifyIdToken() → UPSERT user → returns JWT

**authMiddleware.js — Three guards:**
- protect: jwt.verify() → User.findById() → attaches to req.user
- admin: req.user.role === 'admin'
- vendor: req.user.role === 'vendor' OR 'admin'

**rentalController.js — Most complex controller:**
- createRental: availability check, days calc, totalCost calc, create rental, decrement inventory
- getMyRentals: customer's own, sorted by date
- getVendorRentals: finds all products owned by vendor, gets rentals on those
- getAllRentals: admin view, all rentals
- updatePickupStatus: sets status=active
- updateReturnStatus: calculates late fee (1.5× daily × overdue days), restores inventory
- getRentalReports: aggregate analytics via MongoDB $group

**firebaseAdmin.js:** Firebase Admin SDK init. Uses service account credentials if in env, falls back to Project ID mode.

**helpers.js:** generateToken(id) — JWT 30d. calculateLateFee(endDate, returnDate, pricePerDay) — standalone utility.

---

## 20. Libraries Used

### Frontend Libraries

| Library | Purpose |
|---|---|
| react | Core UI library |
| react-dom | React DOM rendering |
| react-router-dom | BrowserRouter, Routes, Route, Navigate, useContext |
| axios | HTTP client with interceptors |
| firebase | getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged, getAnalytics |
| lucide-react | SVG icon library |
| vite | Dev server and production bundler |
| @vitejs/plugin-react | JSX support and Fast Refresh |

### Backend Libraries

| Library | Purpose |
|---|---|
| express | HTTP server, routing, middleware |
| mongoose | MongoDB ODM with schema, hooks, population |
| firebase-admin | Server-side token verification via getAuth().verifyIdToken() |
| jsonwebtoken | JWT create and verify |
| bcryptjs | Password hashing (genSalt + hash + compare) |
| cors | Cross-origin request support |
| dotenv | .env → process.env |
| multer | Multipart file upload parsing |
| nodemon | Dev auto-restart on file changes |

---

## 21. External Services

### Firebase (Google)

| Item | Value |
|---|---|
| Project ID | rentsphere-338ae |
| Auth Domain | rentsphere-338ae.firebaseapp.com |
| Services | Firebase Auth (Email/Password + Google SSO), Analytics, Admin SDK |
| Client Config | client/.env as VITE_FIREBASE_* variables |
| Server Config | FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY |

> Current Mode: Firebase Admin runs in Project ID fallback mode (no service account keys in .env). Add full credentials for production.

### MongoDB

| Item | Value |
|---|---|
| Type | Local MongoDB instance |
| Port | 27017 |
| Database | rental-system |
| Connection | mongoose.connect(MONGODB_URI) |
| Windows Service | MongoDB (currently set to Manual start) |

---

## 22. Current Project Status

| Area | Status |
|---|---|
| Authentication (Email + Google) | COMPLETE |
| Customer Registration / Login | COMPLETE |
| Vendor Registration / Login | COMPLETE |
| Product CRUD (Vendor) | COMPLETE |
| Product Browse + Filters | COMPLETE |
| Cart Management | COMPLETE |
| Checkout Flow | COMPLETE |
| Rental Creation + Inventory | COMPLETE |
| Order History (Customer) | COMPLETE |
| Vendor Dashboard | COMPLETE |
| Admin Dashboard | COMPLETE |
| Rental Lifecycle (pickup/return) | COMPLETE |
| Late Fee Auto-Calculation | COMPLETE |
| Inventory Auto-Management | COMPLETE |
| Wishlist | COMPLETE |
| Payment Recording | Schema ready; controller partial |
| Real Payment Gateway | NOT IMPLEMENTED |
| Image Upload wired to UI | Middleware ready; UI pending |
| Admin Sub-pages | Stub pages only |
| Email Notifications | NOT IMPLEMENTED |
| Reviews and Ratings | Schema exists; no endpoints |

---

## 23. Known Issues

**1. Firebase Admin Fallback Mode**
No service account keys in server/.env. Google token verification may fail for certain token types. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to server/.env for production.

**2. MongoDB Manual Start**
MongoDB Windows service is set to Manual startup type. Must be started on each reboot, or change to Automatic in Windows Services (services.msc → MongoDB Server → Properties → Startup type: Automatic).

**3. No Real Payment Gateway**
Checkout creates rental but no actual payment processing. PaymentSuccess page is UI-only confirmation. Razorpay or Stripe integration needed before production.

**4. Image Upload Not Wired**
Multer middleware exists in server/middleware/uploadMiddleware.js but product image upload from the vendor portal UI is not implemented.

**5. Admin Sub-pages Are Stubs**
CategoryManagement.jsx, ProductManagement.jsx, DepositManagement.jsx etc. are minimal placeholder stubs. The real management UI is embedded inside AdminDashboard.jsx.

**6. No Review System**
Product.rating and reviewCount fields exist in the schema but there are no API endpoints or UI for customers to submit reviews.

**7. Bulk Delete Is Destructive**
DELETE /api/users/bulk/delete-all has no server-side confirmation check. Can wipe all customer and vendor accounts instantly.

**8. No Refresh Token**
JWT expires in 30 days with no auto-refresh mechanism. Users are silently logged out on expiry.

---

## 24. Future Scope

### Short-Term (Next Sprint)
- Razorpay or Stripe payment gateway integration
- Wire Multer image upload to vendor product creation UI
- Complete admin sub-pages with full management UI
- Product review and rating system (endpoints + UI)
- Email notifications: booking confirmation, pickup reminder, return reminder

### Medium-Term
- Real-time notifications via Socket.io or Firebase Realtime DB
- Vendor earnings dashboard with withdrawal requests
- Multi-image drag-and-drop upload with reorder
- Coupon and discount code system
- Product availability calendar view per listing
- Admin analytics charts (Chart.js or Recharts)

### Long-Term
- React Native mobile app using same Express backend
- AI-powered product recommendation engine
- Geolocation-based search ("find rentals near me")
- Multi-language support (i18n)
- Vendor KYC verification workflow
- Insurance or warranty add-on at checkout
- Subscription plans for vendors (free/pro tiers)

---

## 25. Development Roadmap

```
Phase 1 — Foundation [DONE]
  Project setup, auth system, basic CRUD, role-based routing

Phase 2 — Core Features [DONE]
  Product catalog, cart, checkout, full rental lifecycle, admin dashboard

Phase 3 — Polish and Stability [IN PROGRESS]
  Payment gateway, image upload pipeline, review system,
  error boundaries, loading state improvements

Phase 4 — Growth Features [PLANNED]
  Real-time notifications, analytics charts,
  coupon system, vendor earnings management

Phase 5 — Scale [FUTURE]
  Mobile app (React Native), AI recommendations,
  multi-region deployment
```

---

## 26. Installation Guide

### Prerequisites
- Node.js >= 20.0.0
- MongoDB (local install or Atlas)
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Rental-Management-System
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Configure Server Environment
```bash
copy .env.example .env
# Edit server/.env — see Environment Variables section
```

### Step 4: Install Client Dependencies
```bash
cd ../client
npm install
```

### Step 5: Configure Client Environment
```bash
copy .env.example .env
# Edit client/.env with your Firebase config values
```

### Step 6: Start MongoDB

**Windows (as Administrator):**
```powershell
net start MongoDB
```
Or: Win+R → services.msc → MongoDB Server → Start

**Set MongoDB to auto-start:**
In services.msc → MongoDB Server → Properties → Startup type: Automatic

### Step 7: Start Backend
```bash
cd server
npm run dev
# Server: http://localhost:5000
# Expected output:
# Firebase Admin SDK initialized with Project ID fallback: rentsphere-338ae
# Server running in development mode on port 5000
# MongoDB Connected: 127.0.0.1
```

### Step 8: Start Frontend
```bash
cd client
npm run dev
# Frontend: http://localhost:3000
```

### Step 9: Create Admin Account
1. Register as a customer via the UI at http://localhost:3000/register
2. Open MongoDB Compass (or mongo shell)
3. Navigate to database: rental-system → collection: users
4. Find your user document
5. Edit the role field from "customer" to "admin"
6. Save and log out
7. Log in again → automatically redirected to /admin/dashboard

---

## 27. Environment Variables

### Server — server/.env

| Variable | Required | Example | Description |
|---|---|---|---|
| PORT | YES | 5000 | Express server port |
| MONGODB_URI | YES | mongodb://127.0.0.1:27017/rental-system | MongoDB connection string |
| JWT_SECRET | YES | your_long_random_secret_key | JWT signing secret (use 64+ char random string in production) |
| JWT_EXPIRE | YES | 30d | Token expiry duration |
| NODE_ENV | YES | development | Environment: development or production |
| FIREBASE_PROJECT_ID | Optional | rentsphere-338ae | Firebase project ID |
| FIREBASE_CLIENT_EMAIL | Production | firebase-adminsdk-xxx@project.iam.gserviceaccount.com | Service account email |
| FIREBASE_PRIVATE_KEY | Production | "-----BEGIN PRIVATE KEY-----\n..." | Private key (escape \n as \\n in .env file) |

> Firebase service account variables are optional in development (falls back to Project ID mode) but REQUIRED in production for reliable Google auth token verification.

### Client — client/.env

| Variable | Required | Description |
|---|---|---|
| VITE_API_BASE_URL | YES | http://localhost:5000/api (update to deployed URL for production) |
| VITE_FIREBASE_API_KEY | YES | Firebase web API key |
| VITE_FIREBASE_AUTH_DOMAIN | YES | Firebase auth domain |
| VITE_FIREBASE_PROJECT_ID | YES | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | YES | Firebase storage bucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | YES | Firebase messaging sender ID |
| VITE_FIREBASE_APP_ID | YES | Firebase app ID |
| VITE_FIREBASE_MEASUREMENT_ID | Optional | Firebase Analytics measurement ID |

> **Important:** All client variables MUST be prefixed with VITE_ to be exposed to the browser by Vite.

---

## 28. Deployment Guide

### Backend Deployment (Railway, Render, EC2)

1. Set all variables from server/.env on the hosting platform
2. **MongoDB:** Use MongoDB Atlas for production. Update MONGODB_URI to Atlas connection string.
3. **Firebase Admin:** Download service account JSON from Firebase Console → Project Settings → Service Accounts → Generate new private key. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY as environment variables on the host.
4. **Build command:** None (plain Node.js, no build step)
5. **Start command:** npm start (runs node server.js)
6. **CORS:** Update server.js for production domain:
   ```javascript
   app.use(cors({ origin: 'https://your-frontend-domain.com', credentials: true }));
   ```

### Frontend Deployment (Vercel, Netlify)

1. Build:
   ```bash
   cd client && npm run build
   ```
   Output goes to client/dist/

2. Set VITE_API_BASE_URL to your deployed backend URL in build environment variables

3. Deploy client/dist/ folder

4. **SPA redirect rule:**
   - **Netlify:** Create client/public/_redirects with content: `/* /index.html 200`
   - **Vercel:** Add to vercel.json: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`

5. **Firebase Authorized Domains:** Add your production frontend domain in Firebase Console → Authentication → Settings → Authorized Domains

---

## 29. Testing Guide

### Manual Testing Checklist

**Authentication:**
- [ ] Register as customer (email + password) → success toast shown
- [ ] Verify email received in inbox
- [ ] Login with registered credentials → redirected to /dashboard
- [ ] Login with wrong password → error message shown
- [ ] Register as vendor (role=vendor) → VendorProfile created
- [ ] Login with Google → user auto-created in MongoDB
- [ ] Google login with already-registered email → user linked (no duplicate)
- [ ] Forgot password → reset email received, link works
- [ ] Access /dashboard without login → redirected to /login
- [ ] Access /partner/dashboard as customer → redirected to /dashboard

**Customer Flow:**
- [ ] /products loads with 12 paginated results
- [ ] Filter by category → results filtered correctly
- [ ] Search by keyword → matching products shown
- [ ] Click product → detail page shows all info
- [ ] Add to cart with rental dates → cart count updates
- [ ] /cart shows items with correct dates
- [ ] Remove item from cart → item disappears
- [ ] Complete checkout → rental created in database
- [ ] /payment-success page shown
- [ ] /orders shows rental with status: pending

**Vendor Flow:**
- [ ] Login as vendor → /partner/dashboard loads with KPIs
- [ ] Create new product → appears in /partner/products list
- [ ] Edit product → changes saved correctly
- [ ] Delete product → removed from list
- [ ] Customer rents product → appears in /partner/orders

**Admin Flow:**
- [ ] Login as admin → /admin/dashboard loads
- [ ] All users visible with roles
- [ ] Delete a user → removed from list
- [ ] All rentals visible
- [ ] Mark rental picked up → status changes to: active
- [ ] Mark rental returned (on time) → status: returned, lateFee: 0
- [ ] Mark rental returned (overdue date) → lateFee calculated correctly
- [ ] Create category → appears in product form dropdown
- [ ] Analytics numbers load (total, active, pending, returned, revenue)

### API Test Sequence (Postman / Thunder Client)

```
Base URL: http://localhost:5000/api

1. POST /auth/register
   Body: { name, email, password, phone, role: "customer" }
   Save: { token } as CUSTOMER_TOKEN

2. GET /auth/me
   Headers: Authorization: Bearer CUSTOMER_TOKEN
   Expect: user object returned

3. POST /auth/register
   Body: { name, email, password, role: "vendor", companyName: "Test Shop" }
   Save: { token } as VENDOR_TOKEN

4. POST /products
   Headers: Authorization: Bearer VENDOR_TOKEN
   Body: { title, description, category, condition, location, quantity: 5,
           availableQuantity: 5, pricePerDay: 500, securityDeposit: 1000,
           lateFee: 100, isPublished: true }
   Save: { _id } as PRODUCT_ID

5. GET /products
   Expect: product list including new product

6. POST /rentals
   Headers: Authorization: Bearer CUSTOMER_TOKEN
   Body: { product: PRODUCT_ID, rentStartDate: "2026-09-01", rentEndDate: "2026-09-05" }
   Save: { _id } as RENTAL_ID
   Expect: totalCost = 4 × 500 = 2000

7. GET /rentals/my-rentals
   Headers: Authorization: Bearer CUSTOMER_TOKEN
   Expect: rental with status: pending

8. PATCH /rentals/RENTAL_ID/pickup
   Headers: Authorization: Bearer ADMIN_TOKEN
   Expect: rental.status = active, rental.pickupStatus = picked_up

9. PATCH /rentals/RENTAL_ID/return
   Headers: Authorization: Bearer ADMIN_TOKEN
   If returned on time: lateFee = 0
   If returned late (overdue): lateFee = overdueDays × (500 × 1.5)

10. GET /rentals/reports/analytics
    Headers: Authorization: Bearer ADMIN_TOKEN
    Expect: { total, active, pending, returned, revenue }
```

### Error Scenario Testing

| Scenario | Expected Response |
|---|---|
| Login with wrong password | 401 — Invalid credentials |
| Access /api/rentals (admin) as customer | 403 — Not authorized as an admin |
| POST /api/products without auth token | 401 — Not authorized, no token provided |
| Rent product with availableQuantity=0 | 400 — Product is not available for rent |
| Rent with rentEndDate before rentStartDate | 400 — End date must be after start date |
| Register with email already in use | 400 — User already exists |
| Access /api/products/vendor/my-products as customer | 403 — Not authorized as a vendor |
| Submit invalid Firebase ID Token to /auth/google | 401 — Invalid or expired Firebase ID Token |

---

*Documentation generated from full codebase analysis — August 2026*
*RentSphere v1.0.0 | MERN + Firebase | Node.js 20 | MongoDB local*
