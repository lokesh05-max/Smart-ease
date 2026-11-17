# Real-Time Smart Parking Reservation and Management System (ParkEase)

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-emerald.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black.svg)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-cyan.svg)](https://tailwindcss.com/)

A full-stack, enterprise-grade, real-time web application engineered as a final-year college project to solve urban parking congestion, cruising delays, and parking space underutilization.

---

## 1. Project Overview & Motivation

In densely populated urban hubs and commercial complexes, drivers routinely spend 15 to 25 minutes searching for vacant parking bays. This phenomenon (often called "cruising for parking") contributes up to 30% of downtown traffic congestion, wastes fuel, increases carbon emissions, and creates severe commuter frustration.

**ParkEase** delivers a unified smart mobility solution:
- Drivers can view live parking bay availability, filter by vehicle type (Car, SUV, EV with chargers, Motorcycle), reserve guaranteed slots for specific arrival times, check-in, and automatically settle parking fees upon checkout.
- Facility operators and administrators obtain complete visibility over terminal occupancy in real time, configure slot tariffs, enforce parking rules, and analyze revenue trends through interactive visual dashboards.

---

## 2. Technical Stack

| Tier | Technology | Rationale & Responsibilities |
|---|---|---|
| **Frontend** | React 18, Vite | High-performance reactive UI toolchain with fast HMR |
| **Styling** | Tailwind CSS | Modern responsive design with custom color palette |
| **Routing** | React Router DOM v6 | Declarative client-side routing & route guards |
| **Icons & Charts**| Lucide React, Recharts | Interactive SVG iconography and live analytics charts |
| **Real-Time Client**| Socket.IO Client | Subscribes to live bay telemetry & occupancy changes |
| **Backend API** | Node.js, Express.js | High-throughput asynchronous RESTful API server |
| **Database** | MongoDB with Mongoose | Scalable document persistence with schema validation |
| **Real-Time Server**| Socket.IO Server | Event-driven WebSocket broadcasting across locations |
| **Authentication** | JWT & bcryptjs | Stateless token auth with salted password hashing (10 rounds) |
| **Concurrency Control**| Async Keyed Mutex & Query Logic | Guarantees atomic reservations and eliminates double-bookings |

---

## 3. Concurrency & Double-Booking Prevention

### Overlapping Time Interval Validation
Two reservation windows $[T_{\text{start}, A}, T_{\text{end}, A}]$ and $[T_{\text{start}, B}, T_{\text{end}, B}]$ overlap if and only if:
$$\left(T_{\text{start}, A} < T_{\text{end}, B}\right) \land \left(T_{\text{end}, A} > T_{\text{start}, B}\right)$$

The backend validates slot availability against all active bookings (`Confirmed`, `Pending`, or `Checked-In`) before any new booking is committed.

### Keyed Mutex Serialization
To prevent race conditions where two concurrent HTTP requests target the exact same slot at the exact same millisecond, the backend utilizes an asynchronous `KeyedMutex` locking mechanism keyed by `slotId`:
1. The incoming booking request acquires an exclusive lock on `slotId`.
2. The database is queried for conflicting overlapping reservations.
3. If no conflict exists, the reservation is created and saved.
4. The lock is released in a `finally` block.
5. Concurrent requests attempting to book the same window receive an immediate `409 Conflict` response with the conflicting reference.

---

## 4. User Roles & Capabilities

### Driver / User Role
- **Secure Registration & Authentication**: JWT-based session with encrypted password storage.
- **Terminal Discovery**: Search facilities by city, address, tariff, or supported vehicle types.
- **Live Visual Bay Map**: Interactive floor-by-floor slot grid with color-coded states (*Available*, *Reserved*, *Occupied*, *Maintenance*).
- **Time-Window Booking**: Select arrival date, time, and expected duration.
- **Unique Electronic Pass**: Instant unique booking ID (e.g., `SPK-YYYYMMDD-XXXX`), QR code pass, and printable receipt.
- **Driver Lifecycle**: Manual Check-In on arrival and Check-Out upon departure.
- **Dynamic Tariff Calculation**: Hourly fare calculated based on actual duration parked.
- **Booking Management**: View past trips, cancel eligible reservations, and update profile settings.

### Administrator Role
- **Privileged Dashboard**: Live metric counters (*Total Slots*, *Available*, *Occupied*, *Reserved*, *Revenue*, *Drivers*).
- **Interactive Recharts**: 7-day revenue trend area chart and terminal occupancy comparison bar charts.
- **Facility Management (CRUD)**: Create, modify, and deactivate parking locations.
- **Slot Telemetry Control (CRUD)**: Add, edit, or delete slots; manually override slot states (*Available*, *Occupied*, *Maintenance*) with instant WebSocket broadcast.
- **Reservation Directory**: Filter by status, search by booking reference or user email, and execute admin check-in/out overrides.
- **Driver Directory**: View registered users with lifetime reservation statistics.
- **Reports & Export**: View fleet classification distribution and download CSV revenue logs.

---

## 5. Project Directory Structure

```
smart-parking-system/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # AdminLayout, AdminSidebar, AdminNavbar
│   │   │   ├── common/         # Navbar, Footer, StatusBadge, LoadingSpinner, ProtectedRoute, AdminRoute
│   │   │   └── parking/        # SlotGrid (interactive visual parking map)
│   │   ├── context/            # AuthContext, SocketContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/          # AdminDashboard, ManageLocations, ManageSlots, ManageReservations, ManageUsers, ReportsAnalytics
│   │   │   ├── Home.jsx        # Landing page with hero, live counters, 3-step guide
│   │   │   ├── About.jsx       # Architecture, problem statement & concurrency docs
│   │   │   ├── Locations.jsx   # Public terminal directory with live telemetry
│   │   │   ├── SearchParking.jsx # Time-overlap availability search & reservation engine
│   │   │   ├── BookSlot.jsx    # Direct terminal slot reservation
│   │   │   ├── ReservationConfirmation.jsx # Printable digital pass & QR code
│   │   │   ├── UserDashboard.jsx # Driver portal & active booking spotlight
│   │   │   ├── MyBookings.jsx  # Booking history, check-in, check-out, cancel
│   │   │   ├── BookingDetails.jsx # Pass receipt, check-in/out controls
│   │   │   ├── Profile.jsx     # User settings and password change
│   │   │   ├── Login.jsx       # Auth login with one-click demo credentials
│   │   │   └── Register.jsx    # User registration
│   │   ├── services/           # api.js (Axios with interceptors), socket.js (Socket.IO client)
│   │   ├── App.jsx             # React Router v6 tree & layouts
│   │   ├── index.css           # Tailwind base styles and parking bay effects
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML entry point with Plus Jakarta Sans font
│   ├── tailwind.config.js      # Tailwind configuration with custom navy & blue palette
│   ├── vite.config.js          # Vite config with API and WebSocket proxies
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── server/                     # Node.js + Express Backend
│   ├── scripts/
│   │   └── seed.js             # Database seeder (creates demo users, locations, slots, reservations)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose connection manager
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, login, profile
│   │   │   ├── locationController.js    # Locations list, slots, time-overlap availability
│   │   │   ├── reservationController.js # Atomic booking, check-in, check-out, cancellation
│   │   │   └── adminController.js       # Metrics, CRUD, reports, user directory
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification & admin RBAC middleware
│   │   │   ├── validate.js     # express-validator handler
│   │   │   └── errorHandler.js # Global error handler & Mongoose duplicate key catcher
│   │   ├── models/
│   │   │   ├── User.js         # User model with role and hashed password
│   │   │   ├── ParkingLocation.js # Location model
│   │   │   ├── ParkingSlot.js  # Slot model with compound index {locationId, slotNumber}
│   │   │   ├── Reservation.js  # Reservation model with time-window indexing
│   │   │   └── ActivityLog.js  # Audit log model
│   │   ├── routes/             # REST route endpoints
│   │   ├── sockets/
│   │   │   └── socketManager.js # Socket.IO server, room broadcasting
│   │   ├── utils/
│   │   │   ├── jwt.js          # Token generator/verifier
│   │   │   ├── mutex.js        # Async KeyedMutex for concurrency prevention
│   │   │   └── logger.js       # Activity logger helper
│   │   └── server.js           # Express app, Socket.IO HTTP server, error handlers
│   ├── tests/
│   │   └── run-tests.js        # Automated 14-point backend integration & concurrency test suite
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── package.json                # Root package runner
├── .gitignore
└── README.md
```

---

## 6. Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node.js v24)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB community service (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### Step 1: Clone or Navigate to the Workspace
```powershell
cd "c:\Users\DELL\OneDrive\Desktop\FINAL YR PRO"
```

---

### Step 2: Environment Configuration

#### Backend Environment (`server/.env`)
Ensure `server/.env` is configured (a pre-configured copy is included):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_parking_system
JWT_SECRET=super_secret_smart_parking_jwt_key_2026_academic_demo
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend Environment (`client/.env`)
Ensure `client/.env` is configured:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### Step 3: Install Dependencies

You can install all dependencies from the root directory or in each folder:

```powershell
# In the server folder:
cd server
npm install

# In the client folder:
cd ../client
npm install
```

---

### Step 4: Seed the Database

Run the automated seed script to populate sample parking facilities, slots, vehicle bays, demo accounts, and booking history:

```powershell
# From the server folder:
cd server
npm run seed
```

**Seed Output Confirmation:**
- 3 User accounts created (Admin + 2 Drivers)
- 3 Smart Parking Locations created
- 34 Parking Slots generated across Car, SUV, EV, and Motorcycle types
- Sample reservations (Completed, Active, Confirmed, Cancelled)
- Audit log records populated

---

### Step 5: Demo Credentials

The login screen includes **one-click autofill buttons** (`Demo User` and `Demo Admin`) for presentation grading. You can also log in manually with:

| Role | Email | Password | Access |
|---|---|---|---|
| **System Administrator** | `admin@smartparking.com` | `Admin@123` | Complete admin console, metrics, slot control |
| **Driver / User 1** | `user@smartparking.com` | `User@123` | Booking engine, pass, check-in/out |
| **Driver / User 2** | `sarah@smartparking.com` | `User@123` | Alternate user for multi-session testing |

---

### Step 6: Start the Application

Open two terminal windows (or use the root scripts):

#### Terminal 1: Start Backend Server
```powershell
cd server
npm run dev
```
*Backend runs at:* `http://localhost:5000`  
*WebSocket runs at:* `ws://localhost:5000`

#### Terminal 2: Start Frontend Application
```powershell
cd client
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## 7. Running the Automated Test Suite

A comprehensive 14-point automated test suite is included in `server/tests/run-tests.js`. It validates auth, role-based access control, time-overlap calculations, double-booking rejection, check-in, checkout, fee computation, and reports.

To run the test suite:
```powershell
cd server
npm test
```

### Verified Test Cases:
1. `GET /api/health` returns 200 online
2. Invalid login rejected with `401 Unauthorized`
3. Driver login succeeds with valid JWT token
4. Admin login succeeds with `admin` role
5. Non-admin user blocked from admin endpoints (`403 Forbidden`)
6. Admin successfully fetches dashboard metrics
7. Locations endpoint returns active locations with stats
8. Live slot availability query succeeds
9. Driver successfully reserves parking slot
10. **[CRITICAL] Conflicting overlapping reservation safely rejected with 409 Conflict**
11. Manual Check-in marks vehicle as parked & slot as `Occupied`
12. Manual Check-out calculates final tariff and releases slot to `Available`
13. Reservation cancellation succeeds and restores slot availability
14. Admin reports generate 7-day revenue and vehicle fleet distribution

---

## 8. REST API Reference

### Authentication
- `POST /api/auth/register` - Create new driver account
- `POST /api/auth/login` - Authenticate and obtain JWT token
- `GET /api/auth/me` - Fetch currently logged-in user profile
- `PATCH /api/auth/profile` - Update profile name, phone, or password

### Public Parking Exploration
- `GET /api/locations` - List all active parking terminals with live slot statistics
- `GET /api/locations/:id` - Get terminal layout details
- `GET /api/locations/:id/slots` - List slots for a specific location
- `GET /api/slots/availability` - Query slot availability for a specific arrival date, time window, and vehicle type

### Reservations (JWT Required)
- `POST /api/reservations` - Reserve a parking slot (protected with KeyedMutex & overlap checks)
- `GET /api/reservations/my` - Fetch authenticated driver's bookings
- `GET /api/reservations/:id` - Fetch single reservation pass details
- `PATCH /api/reservations/:id/cancel` - Cancel a reservation and release the bay
- `POST /api/reservations/:id/check-in` - Driver manual arrival check-in (marks bay `Occupied`)
- `POST /api/reservations/:id/check-out` - Driver departure check-out (computes tariff, frees bay)

### Administrator Portal (JWT + Admin Role Required)
- `GET /api/admin/dashboard` - Live telemetry metrics, revenue, and recent logs
- `POST /api/admin/locations` - Create a new parking location
- `PATCH /api/admin/locations/:id` - Update location details
- `DELETE /api/admin/locations/:id` - Deactivate location and associated bays
- `POST /api/admin/slots` - Create a new parking slot (checks duplicate numbers)
- `PATCH /api/admin/slots/:id` - Update slot or manually override status (emits socket event)
- `DELETE /api/admin/slots/:id` - Delete a parking slot
- `GET /api/admin/reservations` - Search and manage all bookings
- `GET /api/admin/users` - Directory of registered drivers with booking counts
- `GET /api/admin/reports` - 7-day revenue logs and vehicle distribution analytics

---

## 9. Manual Demonstration Walkthrough (For Examiners & Evaluators)

1. **Open Two Browser Windows Side-by-Side:**
   - Window A: Log in as **Administrator** (`admin@smartparking.com` / `Admin@123`) and navigate to `Admin Dashboard` or `Manage Parking Slots`.
   - Window B: Log in as **Driver** (`user@smartparking.com` / `User@123`) and navigate to `Search & Reserve`.
2. **Observe Real-Time Socket.IO Synchronization:**
   - In Window B, choose slot `A-01` and confirm reservation.
   - Without refreshing Window A, watch the slot status change instantly to `Reserved` and the Available counter decrement in real time.
3. **Test Double-Booking Prevention:**
   - In a private/incognito tab (or using Sarah's account), attempt to book `A-01` for the overlapping time.
   - The system immediately displays an error banner: *"This slot has already been reserved for the selected time window (Conflicting Booking: SPK-...)"*.
4. **Driver Check-In & Check-Out:**
   - In Window B, navigate to `My Bookings` and click `Check In`.
   - The slot status transitions to `Occupied` in both windows.
   - When finished, click `Check Out & Pay`. The final parking fee is calculated, the reservation is marked `Completed`, and the slot returns to `Available`.
5. **Admin Controls & Reports:**
   - In Window A, test manual override: change any bay status to `Maintenance`. Observe Window B immediately showing the bay greyed out and offline.
   - Click `Reports & Analytics` in the Admin panel and click `Export CSV Report` to download the revenue spreadsheet.

---

## 10. License & Academic Attribution
Developed as an academic final-year capstone project in Computer Science and Engineering (Academic Session 2026).
All source code is fully documented, tested, and ready for local deployment and evaluation.
