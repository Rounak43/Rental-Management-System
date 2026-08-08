# Rental Management System (MERN Stack Boilerplate)

This is a clean, scalable, and professional boilerplate structure for a Rental Management System, designed for a hackathon. The architecture strictly decouples the client (frontend) and server (backend) applications, implementing the MVC (Model-View-Controller) design pattern on the backend and a modular, reusable structure on the frontend.

## Project Structure

```text
Rental-Management-System/
│
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static public assets (favicons, etc.)
│   └── src/
│       ├── assets/             # Global visual resources (CSS, Images, Fonts)
│       │   ├── css/            # Plain global CSS files (variables, resets)
│       │   └── images/         # Static images and icons
│       ├── components/         # Reusable presentation components
│       │   ├── common/         # Atomic UI elements (Buttons, Inputs, Modals, Cards)
│       │   ├── layout/         # Structural wrappers (Navbar, Footer, Sidebar)
│       │   └── protected/      # Route guard wrappers (ProtectedRoute)
│       ├── context/            # Global state context providers
│       │   ├── AuthContext.js  # User session context (login, signup, logout)
│       │   └── CartContext.js  # Active rental cart items and logic
│       ├── hooks/              # Reusable custom React hooks
│       │   └── useFetch.js     # Standard hook for fetching data from the backend
│       ├── pages/              # Routing pages mapped to core requirements
│       │   ├── Auth/           # Registration and login forms
│       │   ├── admin/          # Management dashboards and operations
│       │   └── customer/       # Customer-facing shopping and account pages
│       ├── services/           # HTTP API client integrations (Axios instances)
│       │   ├── api.js          # Shared Axios configuration (interceptors, base URL)
│       │   ├── authService.js  # API actions for user session
│       │   ├── productService.js # API actions for catalog browsing
│       │   └── rentalService.js  # API actions for carts, checkouts, and orders
│       ├── utils/              # Helper functions (converters, custom formats)
│       │   └── formatters.js   # Date, currency, status layout helpers
│       ├── App.jsx             # React routing setup and central context wrapping
│       └── main.jsx            # Frontend application entry point
│
├── server/                     # Backend Node.js & Express API Application
│   ├── config/                 # Configurations for database and external systems
│   │   └── db.js               # Mongoose connection setup
│   ├── controllers/            # Request handlers mapping directly to routes (MVC)
│   │   ├── authController.js   # JWT authentication handlers
│   │   ├── categoryController.js # Operations on product categories
│   │   ├── paymentController.js  # Security deposit, checkout, and refunds
│   │   ├── productController.js  # Inventory and catalog listings
│   │   ├── rentalController.js   # Rental agreements, returns, and delays
│   │   └── userController.js    # Administrative and profile updates
│   ├── middleware/             # Express middlewares
│   │   ├── authMiddleware.js   # Authentication token verify & role check
│   │   ├── errorMiddleware.js  # Centralized REST API error formatter
│   │   └── uploadMiddleware.js # Multer handler for image/file uploads
│   ├── models/                 # Database Schemas & Mongoose Models (MVC)
│   │   ├── Category.js         # Schema for grouping products
│   │   ├── Payment.js          # Rental deposit and billing schema
│   │   ├── Product.js          # Product item status, pricing, and specs
│   │   ├── Rental.js           # Agreements, timelines, late charges, and returns
│   │   └── User.js             # Client and Administrator schema
│   ├── routes/                 # Express Router endpoint mappings (MVC)
│   │   ├── index.js            # Main router binding sub-routes
│   │   ├── authRoutes.js       # Register, login, token refresh
│   │   ├── categoryRoutes.js   # Manage and fetch item groups
│   │   ├── paymentRoutes.js    # Invoicing and transaction logging
│   │   ├── productRoutes.js    # Inventory routes (admin/customer)
│   │   ├── rentalRoutes.js     # Cart checkout, status checks, pickups, returns
│   │   └── userRoutes.js       # Profile views and admin user management
│   ├── uploads/                # Local file upload directory (git-kept)
│   ├── utils/                  # Backend support tools
│   │   └── helpers.js          # Password hashing, late fee calculators, etc.
│   └── server.js               # Backend application entry point and server setup
│
└── README.md                   # This file
```

---

## Design Decoupling & Conventions

1. **Clean Decoupling**: Frontend and Backend have separate dependencies, packages, configurations, and variables (`.env`). This guarantees they can be deployed independently (e.g., Netlify/Vercel for Frontend, Heroku/Render/AWS for Backend).
2. **MVC Architecture**: The backend uses the Model-View-Controller design pattern (where the React client serves as the View). Express routes map to controllers, which interact with Mongoose models to retrieve and save data, maintaining a strict Separation of Concerns.
3. **Responsive Plain CSS**: CSS is isolated in modern layout rules (Flexbox, Grid, CSS Variables) within `client/src/assets/css/main.css`, ensuring performance and clean layout resets without needing external build systems (like Tailwind or Bootstrap).

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local installation

### Setting up the Server
1. Navigate into the `server/` directory:
   ```bash
   cd server
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Configure the environment variables in `.env` (MongoDB connection string, JWT secret, and PORT).
4. Install backend dependencies:
   ```bash
   npm install
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

### Setting up the Client
1. Navigate into the `client/` directory:
   ```bash
   cd client
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Configure frontend variables in `.env` (like API endpoint base URL).
4. Install frontend dependencies:
   ```bash
   npm install
   ```
5. Run the Vite development server:
   ```bash
   npm run dev
   ```
