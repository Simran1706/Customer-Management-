# Customer Management System

A full-stack customer management system built with React, Node.js, Express, and MongoDB. The application provides public customer registration, an isolated customer self-service portal, and a protected Super Admin management dashboard.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Architecture](#project-architecture)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Default Demo Credentials](#default-demo-credentials)
- [REST API Reference](#rest-api-reference)
- [Database Schema](#database-schema)
- [Security & Validation Standards](#security--validation-standards)

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router DOM, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs (password hashing with 10 salt rounds)
- **Validation**: express-validator (backend), custom regex and real-time state validation (frontend)
- **Security**: Helmet, CORS, Express Rate Limit

---

## Key Features

### 1. Landing Page & Registration
- Responsive landing page with clear platform breakdown.
- Customer registration form with live real-time validation:
  - Full Name: Alphabetic characters and spaces only (min 2, max 60 chars).
  - Email: RFC-compliant email validation with duplicate check.
  - Phone: Strict 10-digit mobile number validation with real-time digit counter (`X/10 digits`).
  - Physical Address: Character length validation (min 8 chars).
  - Password & Confirm Password: Live password strength meter and matching indicator.
- Instant error and success alerts with auto-redirect to customer portal on registration.

### 2. Customer Portal
- Dedicated login page (`/login`) with role validation.
- Profile view displaying account status, member since date, contact information, and address.
- Edit profile: Allows updating allowed contact fields (Name, Phone, Address). Email is locked to prevent identity takeover.
- Change password: Requires existing password verification before accepting new password.
- Strict data isolation: Customers can only query and mutate their own profile via `req.user.id` resolved from verified JWT payloads.

### 3. Super Admin Panel
- Dedicated administrator login (`/admin/login`) with role enforcement.
- Key metrics dashboard: Total customers, active accounts, inactive accounts, and recent registrations (last 30 days).
- Customer directory table with:
  - Real-time search across Name, Email, and Phone number.
  - Status filter (`All`, `Active`, `Inactive`).
  - Full pagination controls with items-per-page selector (5, 10, 20, 50).
  - View modal: Inspect complete customer record, registration date, and address.
  - Edit modal: Inline editing of customer information with 10-digit phone enforcement.
  - Account status toggle: One-click activate/deactivate action with confirmation prompt.
- Inactive customer accounts are immediately barred from logging in or making API requests (HTTP 403 Forbidden).

---

## Project Architecture

```
Customersupport/
├── package.json              # Root orchestration script (concurrently)
├── .gitignore                # Excludes node_modules, build outputs, and secrets
├── README.md
│
├── server/                   # Backend REST API
│   ├── .env                  # Local environment configuration
│   ├── .env.example          # Sample configuration template
│   ├── package.json
│   └── src/
│       ├── config/db.js      # MongoDB connection with memory-server fallback
│       ├── controllers/
│       │   ├── authController.js       # Register, login, me
│       │   ├── customerController.js   # Customer profile, update, change password
│       │   └── adminController.js      # Admin metrics, customer CRUD, status toggle
│       ├── middleware/
│       │   ├── auth.js                 # verifyToken, isAdmin, isCustomer guards
│       │   ├── validator.js            # express-validator schemas
│       │   └── errorHandler.js         # Centralized error handler
│       ├── models/User.js              # Mongoose user schema with bcrypt hooks
│       ├── routes/
│       │   ├── authRoutes.js           # /api/auth
│       │   ├── customerRoutes.js       # /api/customer
│       │   └── adminRoutes.js          # /api/admin
│       ├── utils/
│       │   ├── seedAdmin.js            # Initial admin and customer seeder
│       │   └── cleanData.js            # Database sanitization script
│       └── server.js                   # Application entrypoint
│
└── client/                   # Frontend React Client
    ├── index.html
    ├── vite.config.js        # Configured with proxy to backend port 5000
    ├── tailwind.config.js    # Styling design tokens
    ├── package.json
    └── src/
        ├── api/axiosClient.js          # Axios client with JWT interceptor
        ├── components/                 # Reusable UI components
        │   ├── Alert.jsx
        │   ├── Footer.jsx
        │   ├── Modal.jsx
        │   ├── Navbar.jsx
        │   ├── Pagination.jsx
        │   ├── ProtectedRoute.jsx
        │   └── StatCard.jsx
        ├── context/AuthContext.jsx     # Authentication context provider
        ├── pages/
        │   ├── LandingPage.jsx         # Landing page and registration form
        │   ├── CustomerLogin.jsx       # Customer login view
        │   ├── AdminLogin.jsx          # Super Admin login view
        │   ├── CustomerDashboard.jsx   # Customer account portal
        │   ├── AdminDashboard.jsx      # Admin management console
        │   └── NotFound.jsx            # 404 view
        ├── App.jsx                     # Application routes
        ├── index.css
        └── main.jsx
```

---

## Local Development Setup

### Prerequisites
- Node.js (version 18.x or later)
- MongoDB running locally on port 27017 (or a MongoDB Atlas connection string)

### 1. Installation
Clone the repository and install all dependencies:

```bash
git clone https://github.com/Simran1706/Customer-Management-.git
cd Customer-Management-

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Run the Application
From the root directory, run:

```bash
npm run dev
```

This starts both:
- Backend API at `http://localhost:5000`
- Frontend Client at `http://localhost:5173`

The database will automatically initialize and seed the default Super Admin and demo customers on initial startup.

---

## Environment Configuration

Configuration values are stored in `server/.env`. A template is provided in `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/customer_management
JWT_SECRET=super_secure_jwt_secret_key_crm_enterprise_2026_xyz
JWT_EXPIRE=7d
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@crm.com
ADMIN_PASSWORD=Admin@12345
ADMIN_PHONE=9876543210
ADMIN_ADDRESS=Enterprise HQ, 100 Tech Blvd, Silicon Valley, CA
CLIENT_URL=http://localhost:5173
```

---

## Default Demo Credentials

### Super Admin
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@crm.com`
- **Password**: `Admin@12345`
*(A one-click Auto Fill button is provided on the admin login page for testing).*

### Sample Customers
| Name | Email | Password | Status | Phone |
|---|---|---|---|---|
| Priya Sharma | `priya.sharma@zenithlabs.in` | `Password@123` | Active | `9876543210` |
| David Miller | `david.miller@techflow.io` | `Password@123` | Active | `9432109876` |
| Elena Rostova | `elena.rostova@cloudscale.net` | `Password@123` | Inactive | `9543210987` |

*Note: Elena Rostova has an Inactive status, which can be used to test the deactivation login block.*

---

## REST API Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new customer | Public |
| POST | `/api/auth/login` | Login user (customer or admin) | Public |
| GET | `/api/auth/me` | Get current authenticated user profile | Private (Bearer token) |

### Customer Portal Endpoints (`/api/customer`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/customer/profile` | Get logged-in customer's profile | Customer Role |
| PUT | `/api/customer/profile` | Update allowed fields (Name, Phone, Address) | Customer Role |
| PUT | `/api/customer/change-password` | Change password with current password check | Customer Role |

### Super Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/admin/metrics` | Customer metrics summary counts | Admin Role |
| GET | `/api/admin/customers` | Searchable, paginated customer list (`?search=&status=&page=&limit=`) | Admin Role |
| GET | `/api/admin/customers/:id` | Get customer details by ID | Admin Role |
| PUT | `/api/admin/customers/:id` | Update customer record | Admin Role |
| PATCH | `/api/admin/customers/:id/status` | Toggle customer active/inactive status | Admin Role |

---

## Database Schema

```javascript
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      match: /^[a-zA-Z\s.]+$/
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^(\+91[\-\s]?)?[6-9]\d{9}$|^[0-9]{10}$/
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 300
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true // createdAt and updatedAt
  }
);
```

---

## Security & Validation Standards

1. **Password Hashing**: Passwords are never saved in plain text. A pre-save Mongoose hook hashes them with bcrypt using 10 salt rounds. Passwords are set with `select: false` and stripped from JSON serializations.
2. **Duplicate Email Prevention**: Unique indexing at the database level coupled with pre-query checks returns explicit HTTP 409 Conflict responses.
3. **Role-Based Access Control**: Middleware verifies JWT signatures and matches role requirements (`isAdmin`, `isCustomer`). Customers attempting to reach administrative endpoints receive an HTTP 403 Forbidden response.
4. **Data Isolation**: Customer endpoints do not take arbitrary user IDs in URL parameters or request bodies. The user context is resolved exclusively from `req.user.id`.
5. **Account Deactivation**: When an admin marks an account as inactive, that account's JWT session is rejected on subsequent API requests, and new logins are blocked.
6. **Input Validation**: Both client-side and server-side validation layers ensure consistent data types, strict 10-digit phone number formatting, and valid email structures before reaching persistence.
