# DriveHub — Car Rental Platform (Demo Project)

A full-stack car rental demo application built with **NestJS + MariaDB** on the backend and **React + Tailwind CSS** on the frontend. Supports customer browsing/booking and a full admin management dashboard.

---

## Tech Stack

**Backend**
- [NestJS](https://nestjs.com/) (Node.js framework)
- [MariaDB](https://mariadb.org/) via [TypeORM](https://typeorm.io/) (`mysql2` driver)
- JWT authentication with role-based access control (`user` / `admin`)
- [Cloudinary](https://cloudinary.com/) for car image storage
- `bcrypt` for password hashing
- `class-validator` / `class-transformer` for request validation
- Swagger (OpenAPI) auto-generated docs
- Rate limiting via `@nestjs/throttler`

**Frontend**
- React (Vite)
- Tailwind CSS v4
- React Router (client-side routing)
- Axios (API client with JWT interceptor)
- `lucide-react` (icons)

---

## Project Structure

```
car-rental-project/
├── car-rental-backend/
│   └── src/
│       ├── auth/          # Register, login, JWT strategy, guards
│       ├── users/         # User profile, customer management (admin)
│       ├── cars/          # Car CRUD, search/filter, image upload
│       ├── bookings/      # Booking creation, overlap prevention, pricing
│       ├── settings/      # Admin-configurable business fees
│       ├── cloudinary/    # Cloudinary upload provider/service
│       └── config/        # Database configuration
│
└── car-rental-frontend/
    └── src/
        ├── pages/          # HomePage, ListingPage, CarDetailsPage,
        │                   # AuthPage, AdminDashboard, MyBookingsPage
        ├── components/     # EditCarModal, etc.
        ├── context/        # AuthContext (login state, JWT handling)
        └── services/       # Axios instance (api.js)
```

---

## Features

### Customer-facing
- Browse fleet with search, filters (city, type, transmission, price), and sorting
- Car details page with image gallery, specs, and live price calculator
- Booking with automatic **double-booking prevention** (date-overlap check) and server-calculated pricing (base rate + optional driver + optional insurance + service fee)
- Register / Login (JWT-based)
- **My Bookings** — view booking history and cancel pending/active bookings

### Admin
- **Bookings** — view all bookings, update status (Pending → Active → Completed / Cancelled)
- **Fleet** — add new cars (with image upload to Cloudinary), edit car details, toggle availability, delete cars
- **Customers** — view all registered users, block/unblock accounts
- **Settings** — edit own profile (name/phone), and edit business-wide fees (driver fee/day, insurance fee/day, flat service fee) — these feed directly into every new booking's price calculation

---

## Backend Setup

1. Install dependencies:
   ```bash
   cd car-rental-backend
   npm install --legacy-peer-deps
   ```

2. Create a MariaDB database (e.g. via phpMyAdmin/XAMPP):
   ```sql
   CREATE DATABASE car_rental_db;
   ```

3. Copy `.env.example` to `.env` and fill in your values:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=
   DB_DATABASE=car_rental_db

   JWT_SECRET=your_long_random_secret
   JWT_EXPIRES_IN=7d

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Run the server:
   ```bash
   npm run start:dev
   ```

   - API base URL: `http://localhost:3000/api/v1`
   - Swagger docs: `http://localhost:3000/api/docs`
   - Tables are auto-created on first run (`synchronize: true` in dev)

### Making a user an admin
There is no signup option for admin accounts (by design). To promote a user:
1. Register normally through the app.
2. In phpMyAdmin, open the `users` table and change that row's `role` column from `user` to `admin`.
3. Log out and log back in (so a fresh JWT with the `admin` role is issued).

---

## Frontend Setup

1. Install dependencies:
   ```bash
   cd car-rental-frontend
   npm install
   ```

2. Create a `.env` file in the project root:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

   App runs at `http://localhost:5173`.

### Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Home / landing page |
| `/fleet` | Public | Browse & filter cars |
| `/cars/:id` | Public (booking requires login) | Car details + booking |
| `/auth` | Public | Login / Register |
| `/my-bookings` | Logged-in user | Booking history |
| `/admin` | Admin only | Management dashboard |

---

## Key API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Log in, get JWT |
| GET/PATCH | `/users/me` | Authenticated | View/update own profile |
| GET | `/users` | Admin | List all customers |
| PATCH | `/users/:id/status` | Admin | Block/unblock a customer |
| GET | `/cars` | Public | Search/filter available cars |
| GET | `/cars/:id` | Public | Car details |
| POST | `/cars` | Admin | Add car (multipart, with images) |
| PATCH | `/cars/:id` | Admin | Update car details |
| PATCH | `/cars/:id/availability` | Admin | Toggle availability |
| DELETE | `/cars/:id` | Admin | Delete car |
| POST | `/bookings` | Authenticated | Create booking (overlap-checked) |
| GET | `/bookings/my` | Authenticated | Own booking history |
| GET | `/bookings` | Admin | All bookings |
| PATCH | `/bookings/:id/status` | Admin | Update booking status |
| PATCH | `/bookings/:id/cancel` | Owner or Admin | Cancel a booking |
| GET | `/settings` | Public | Current fee rates (used for price estimates) |
| PATCH | `/settings` | Admin | Update fee rates |

Full interactive documentation is available via Swagger at `/api/docs` once the backend is running.

---

## Known Limitations / Not Yet Implemented

This is a demo project — the following were scoped out or left as static placeholders:

- **Reviews** on the car details page are static sample content (no reviews backend exists yet)
- **Wishlist/favorites** — not implemented
- **Payment gateway integration** — bookings are recorded but no real payment is processed
- **Email notifications** (booking confirmations, cancellations) — not implemented
- **Invoice/PDF generation** — not implemented
- **AI features** (originally planned: chatbot assistant, natural-language search, smart recommendations via NVIDIA Nemotron) — not yet built
- A few homepage marketing stats ("Serving 12 cities", "4,200+ trips completed") are static copy, not derived from real data

---

## Notes

- Passwords are hashed with bcrypt and never returned in any API response.
- All admin-only routes are protected both in the frontend (route guards) and the backend (JWT + role guards) — frontend guards are for UX only; the backend is the actual security boundary.
- Business fees (driver/insurance/service) are stored in the database and editable by admins — booking price estimates shown to customers are fetched live from the same source the backend uses to calculate the final charge, so they always match.
