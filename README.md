# Enterprise Customer Management System (CRM)

A full-stack Customer Management System built using **React**, **Node.js / Express**, and **MongoDB (Mongoose)**, following clean architecture patterns and production-level standards.

---

## 🌟 Key Features

### 1. Public Landing Page & Customer Registration
- **Modern Responsive Design**: Built with Tailwind CSS, sleek typography, micro-interactions, and accessibility considerations.
- **Client-Side & Server-Side Validation**:
  - Validates all required fields: `name`, `email`, `phone`, `address`, `password`, `confirmPassword`.
  - Email format RFC compliance and phone format regex matching.
  - Real-time password confirmation check.
  - Duplicate email prevention (with HTTP 409 conflict detection).
  - Clear success and error notifications.
- **Auto-Login & Redirect**: Redirects immediately upon successful registration.

### 2. Database & Data Security (MongoDB + Mongoose)
- **User Schema**:
  - `name`: String, required, trim, 2-100 chars
  - `email`: String, required, unique index, lowercase
  - `phone`: String, required, format validated
  - `address`: String, required, 5-300 chars
  - `password`: Hashed using **Bcrypt (10 salt rounds)**, excluded from default queries (`select: false`)
  - `role`: Enum `['customer', 'admin']`, defaults to `customer`
  - `status`: Enum `['active', 'inactive']`, defaults to `active`
  - `createdAt` & `updatedAt`: Automatic timestamps
- **Password Protection**: Pre-save Mongoose hook only hashes passwords when modified. Model never leaks password in `toJSON()` responses.

### 3. Customer Portal
- **Profile Overview**: View authenticated customer information (name, email, phone, address, joined date, account status).
- **Edit Allowed Information**: Safe self-service updating for `name`, `phone`, and `address` (email is locked to prevent identity takeover).
- **Change Password**: Secure workflow requiring current password verification before updating.
- **Strict Data Isolation**: Customers can **only** view and modify their own data. Backend enforces isolation via cryptographic JWT payloads (`req.user.id`).
- **Logout**: Complete session termination and token revocation.

### 4. Super Admin Console
- **Key Performance Metrics**: Real-time counts for Total Customers, Active Accounts, Inactive Accounts, and New Registrations (last 30 days).
- **Customer List Table**: Responsive directory showing name, email, phone, address, status, and joined date.
- **Instant Search**: Search across name, email, and phone with immediate result filtering.
- **Status Filtering**: Filter by `All`, `Active`, or `Inactive`.
- **View Customer Details**: Modal with complete account timeline and metadata.
- **Edit Customer Details**: Modal allowing Super Admins to update customer details and status.
- **Activate / Deactivate Toggle**: Instantly activate or deactivate accounts with confirmation modals. Deactivated customers are immediately barred from logging in or calling API endpoints.
- **Pagination**: Fully responsive pagination controls with custom page size selector (5, 10, 20, 50).
- **Auto-Seeder**: Automatic generation of default Super Admin credentials on boot.

### 5. Authentication & Security
- **JWT (JSON Web Tokens)**: Secure token generation with configurable expiration.
- **Role-Based Access Control (RBAC)**: Route middleware guards:
  - `verifyToken`: Validates bearer token and verifies user status.
  - `isCustomer`: Prevents admins or unauthorized users from customer endpoints.
  - `isAdmin`: Protects all administrative and metrics routes.
- **Active Account Check**: Deactivated accounts receive `403 Forbidden` error.
- **Security Middleware**: `helmet`, `cors`, `morgan`, and rate limiting on auth endpoints.

---

## 🗂️ Project Architecture

```
Customersupport/
├── server/                         # Express & MongoDB REST API
│   ├── .env                        # Server environment variables
│   ├── .env.example                # Template environment variables
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js               # MongoDB connection setup
│       ├── controllers/
│       │   ├── authController.js   # Register, Login, Me
│       │   ├── customerController.js # Profile, Edit Profile, Change Password
│       │   └── adminController.js  # Metrics, Customers CRUD, Status Toggle
│       ├── middleware/
│       │   ├── auth.js             # verifyToken, isAdmin, isCustomer guards
│       │   ├── errorHandler.js     # Centralized error handler
│       │   └── validator.js        # express-validator schemas
│       ├── models/
│       │   └── User.js             # Mongoose schema + bcrypt hooks
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth
│       │   ├── customerRoutes.js   # /api/customer
│       │   └── adminRoutes.js      # /api/admin
│       ├── utils/
│       │   └── seedAdmin.js        # Auto-seed Super Admin & demo customers
│       └── server.js               # Express application entrypoint
│
├── client/                         # React 18 + Vite + Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       │   └── axiosClient.js      # Axios instance with JWT interceptor
│       ├── components/
│       │   ├── Alert.jsx           # Reusable feedback alerts
│       │   ├── Footer.jsx          # App footer
│       │   ├── Modal.jsx           # Accessible dialog modal
│       │   ├── Navbar.jsx          # Header with user menu
│       │   ├── Pagination.jsx      # Pagination controls
│       │   ├── ProtectedRoute.jsx  # RBAC route guard
│       │   └── StatCard.jsx        # Dashboard metric cards
│       ├── context/
│       │   └── AuthContext.jsx     # Authentication state & actions
│       ├── pages/
│       │   ├── LandingPage.jsx     # Landing page & registration form
│       │   ├── CustomerLogin.jsx   # Customer login page
│       │   ├── AdminLogin.jsx      # Super Admin login page
│       │   ├── CustomerDashboard.jsx # Customer profile & self-service
│       │   ├── AdminDashboard.jsx  # Super Admin control center
│       │   └── NotFound.jsx        # 404 page
│       ├── App.jsx                 # Routing configuration
│       ├── index.css               # Global Tailwind styles
│       └── main.jsx                # DOM entry point
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

---

### Step 1: Start the Backend Server

```bash
# Navigate to the server directory
cd server

# Install backend dependencies
npm install

# Start the server (runs on port 5000 by default)
npm run dev
# OR: npm start
```

*Note: On first startup, the database will automatically seed the Super Admin account and demo customer accounts.*

---

### Step 2: Start the Frontend Application

Open a new terminal window:

```bash
# Navigate to the client directory
cd client

# Install frontend dependencies
npm install

# Start the Vite development server (runs on port 5173 by default)
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Credentials

### Super Admin Account
| Field | Value |
|---|---|
| **URL** | `http://localhost:5173/admin/login` |
| **Email** | `admin@crm.com` |
| **Password** | `Admin@12345` |
| **Privileges** | View all metrics, search, view, edit, activate/deactivate customers |

*(Tip: The Admin Login page includes a one-click "Auto Fill" button to test instantly.)*

### Demo Customer Accounts (Pre-Seeded)
| Name | Email | Password | Status |
|---|---|---|---|
| Sarah Connor | `sarah.connor@example.com` | `Password@123` | Active |
| David Miller | `david.miller@techflow.io` | `Password@123` | Active |
| Elena Rostova | `elena.rostova@cloudscale.net` | `Password@123` | Inactive *(test deactivated login block)* |

---

## 📡 API Endpoints Reference

### Public Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new customer | No |
| `POST` | `/api/auth/login` | Log in customer or admin | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Bearer Token |

### Customer Portal (`/api/customer`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/customer/profile` | Get logged-in customer's profile | Customer Role |
| `PUT` | `/api/customer/profile` | Update allowed fields (name, phone, address) | Customer Role |
| `PUT` | `/api/customer/change-password` | Verify current & set new password | Customer Role |

### Super Admin Console (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/admin/metrics` | Total, active, inactive, and 30-day customer counts | Admin Role |
| `GET` | `/api/admin/customers` | Searchable, paginated customer list (`?search=&status=&page=&limit=`) | Admin Role |
| `GET` | `/api/admin/customers/:id` | Get customer record details by ID | Admin Role |
| `PUT` | `/api/admin/customers/:id` | Update customer record details | Admin Role |
| `PATCH`| `/api/admin/customers/:id/status` | Toggle or set customer active/inactive status | Admin Role |

---

## ✅ Acceptance Criteria Matrix

| Criterion | Implementation | Status |
|---|---|---|
| **Customer can register** | Live interactive form on landing page with instant feedback | ✅ Completed |
| **Form validation works** | Client-side validation + `express-validator` schema backend validation | ✅ Completed |
| **Data saved in database** | MongoDB Mongoose model with timestamps and unique email index | ✅ Completed |
| **Password hashed** | Bcrypt with 10 salt rounds in pre-save hook; never returned in responses | ✅ Completed |
| **Customer can login** | Separate `/login` page with JWT issuance | ✅ Completed |
| **Customer only sees own data** | Secured by `req.user.id` on backend; no ID passed in query/param | ✅ Completed |
| **Admin can login** | Separate `/admin/login` page with role verification | ✅ Completed |
| **Admin can manage customers** | Admin dashboard with view details modal, edit modal, status toggle | ✅ Completed |
| **Search & pagination work** | Live search by name/email/phone with pagination controls & page size selector | ✅ Completed |
| **Auth & Security** | JWT bearer tokens, RBAC middleware, active check, rate limit, helmet | ✅ Completed |
| **Responsive UI** | Tailwind CSS with mobile, tablet, and desktop layouts | ✅ Completed |

---

## 🛡️ Security Best Practices Applied
1. **Password Hashing**: Bcrypt with auto-salt generation.
2. **Prevent Duplicate Registrations**: Unique index at MongoDB level plus explicit existence check with 409 Conflict.
3. **Information Disclosure Prevention**: Passwords are set with `select: false` and stripped via `toJSON` transform.
4. **Strict RBAC**: Routes verify user role directly from database record attached by JWT middleware.
5. **Session Invalidation on Deactivation**: Deactivated users cannot log in and are denied on every subsequent API request (`403 Forbidden`).
6. **Cross-Origin Resource Sharing (CORS)**: Configured with explicit origins and headers.
7. **Rate Limiting**: Protects authentication endpoints from credential-stuffing attacks.
