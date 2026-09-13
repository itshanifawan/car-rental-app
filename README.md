
<img width="1536" height="1024" alt="ChatGPT Image Sep 13, 2026, 09_56_34 AM" src="https://github.com/user-attachments/assets/fb155396-c1cb-4d14-8b0e-e878b899efd3" />
<img width="1672" height="940" alt="ChatGPT Image Sep 13, 2026, 09_51_03 AM" src="https://github.com/user-attachments/assets/b7d4f357-1620-4069-bc9c-8830b940f320" />
<img width="1672" height="940" alt="ChatGPT Image Sep 13, 2026, 09_49_18 AM" src="https://github.com/user-attachments/assets/25007386-87b1-4f82-bfe0-e7d45a080363" />


# DriveHub — Car Rental Platform

A full-stack car rental application built with **NestJS + MariaDB/MySQL** on the backend and **React + Tailwind CSS** on the frontend. Includes customer browsing/booking, a full admin management dashboard, and is deployed live (frontend on Vercel, backend + database on Railway).

**Live demo:** `https://car-rental-app-peach.vercel.app`

                                                                ADMIN DASHBOARD::
                                                                email:zeetajohn3@gmail.com
                                                                pass:Hanifawan@123

---

## Tech Stack

**Backend**
- [NestJS](https://nestjs.com/) (Node.js framework)
- [MariaDB](https://mariadb.org/) locally / MySQL in production, via [TypeORM](https://typeorm.io/) (`mysql2` driver)
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

**Hosting**
- Frontend: [Vercel](https://vercel.com/)
- Backend + Database: [Railway](https://railway.com/)

---

## Project Structure

```
car-rental-project/
├── car-rental-backend/
│   ├── .npmrc               # forces legacy-peer-deps for every npm install
│   └── src/
│       ├── auth/            # Register, login, JWT strategy, guards
│       ├── users/           # User profile, customer management (admin)
│       ├── cars/            # Car CRUD, search/filter, image upload
│       ├── bookings/        # Booking creation, overlap prevention, pricing
│       ├── settings/        # Admin-configurable business fees
│       ├── cloudinary/      # Cloudinary upload provider/service
│       └── config/          # Database configuration
│
├── car-rental-frontend/
│   ├── vercel.json           # SPA routing fix for Vercel
│   └── src/
│       ├── pages/            # HomePage, ListingPage, CarDetailsPage,
│       │                     # AuthPage, AdminDashboard, MyBookingsPage
│       ├── components/       # EditCarModal, etc.
│       ├── context/          # AuthContext (login state, JWT handling)
│       └── services/         # Axios instance (api.js)
│
└── README.md
```

---

## Features

### Customer-facing
- Browse fleet with search, filters (city, type, transmission, price), and sorting
- Car details page with image gallery, specs, and a live price calculator
- Booking with automatic **double-booking prevention** (date-overlap check) and server-calculated pricing (base rate + optional driver + optional insurance + service fee)
- Register / Login (JWT-based)
- **My Bookings** — view booking history and cancel pending/active bookings
- Nav bar adapts to login state across all public pages (Sign in → user name → role-based shortcut to Dashboard or My Bookings)

### Admin
- **Bookings** — view all bookings, update status (Pending → Active → Completed / Cancelled)
- **Fleet** — add new cars (with image upload to Cloudinary), edit car details, toggle availability, delete cars
- **Customers** — view all registered users, block/unblock accounts
- **Settings** — edit own profile (name/phone), and edit business-wide fees (driver fee/day, insurance fee/day, flat service fee) — these feed directly into every new booking's price calculation, and the customer-facing price estimate always matches because both read from the same source

---

## Local Development Setup

### Backend

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
   - Tables are auto-created on first run (`synchronize: true` while `NODE_ENV` is not `production`)

### Frontend

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

### Making a user an admin (local)
There is no admin signup option (by design). To promote a user locally:
1. Register normally through the app.
2. In phpMyAdmin, open the `users` table and change that row's `role` column from `user` to `admin`.
3. Log out and log back in (so a fresh JWT with the `admin` role is issued).

---

## Deployment

The frontend and backend are deployed **separately** — this project is a NestJS server with a real database connection, which doesn't fit a serverless platform like Vercel. Vercel hosts the frontend; Railway hosts the backend and database.

### Backend — Railway

1. Create a new Railway project and connect it to the GitHub repo.
2. Since the repo is a monorepo (backend + frontend in one repo), Railway's build system (Railpack) can't auto-detect the app at the root. In the service's **Settings → Source**, set:
   ```
   Root Directory: car-rental-backend
   ```
3. In **Settings → Build**, set:
   ```
   Build Command: npm run build
   ```
4. In **Settings → Deploy**, set:
   ```
   Start Command: npm run start:prod
   ```
5. **Peer dependency conflicts:** this project's NestJS packages have version mismatches that require `--legacy-peer-deps`. Relying on a custom install command or an environment variable to inject this flag was unreliable on Railway's builder — the flag simply didn't get applied. The dependable fix was committing an `.npmrc` file inside `car-rental-backend/`:
   ```
   legacy-peer-deps=true
   ```
   This makes every `npm install`, on any platform, behave as if `--legacy-peer-deps` were passed — no platform-specific configuration needed.
6. Add a MySQL database **in the same Railway project** (Railway → "+ New" → "Database" → "Add MySQL"). Cross-project services can't reach each other over Railway's private network, so this step matters.
7. In the backend service's **Variables**, set the database connection using the MySQL service's generated values (names differ from ours — map them manually):

   | Backend variable | Value comes from MySQL service's... |
   |---|---|
   | `DB_HOST` | `MYSQLHOST` (e.g. `mysql.railway.internal`) |
   | `DB_PORT` | `MYSQLPORT` |
   | `DB_USERNAME` | `MYSQLUSER` |
   | `DB_PASSWORD` | `MYSQLPASSWORD` |
   | `DB_DATABASE` | `MYSQLDATABASE` |

   Also set `JWT_SECRET`, `JWT_EXPIRES_IN`, the `CLOUDINARY_*` values, and `FRONTEND_URL` (the deployed Vercel URL — required for CORS to allow the frontend to call the API). Leave `NODE_ENV` as `development` until the database schema has been created at least once (production mode disables `synchronize`, which is what auto-creates tables).
8. Under **Settings → Networking**, click **Generate Domain** to get a public URL. Test it by visiting `<url>/api/docs` — Swagger should load if everything is wired correctly.
9. **The production database is separate from your local one.** A user promoted to `admin` locally is *not* admin on the live site — promote the account again by running SQL directly in Railway's MySQL **Data** tab:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
   Log out and back in on the live site afterward so a fresh JWT with the `admin` role is issued.

### Frontend — Vercel

1. Import the GitHub repo into Vercel, and set the **Root Directory** to `car-rental-frontend`.
2. Add an environment variable:
   ```
   VITE_API_URL = https://<your-railway-backend-domain>/api/v1
   ```
3. **SPA routing fix:** React Router handles routes client-side, but a hard refresh on any route other than `/` (e.g. `/auth`) causes Vercel's static file server to return a raw `404: NOT_FOUND`, since no physical file exists at that path. Fixed by committing `vercel.json` in `car-rental-frontend/`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
4. Deploy. Once live, go back to the Railway backend and set `FRONTEND_URL` to this Vercel URL — without this, the browser will block API calls due to CORS, which looks like "login doesn't work" even though the request never truly reached the server.

### Deploying updates
For any future change (frontend or backend), from the repo root:
```bash
git add .
git commit -m "Describe what changed"
git push
```
Both Railway and Vercel auto-deploy on push once initially connected.

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

Full interactive documentation is available via Swagger at `/api/docs` on either the local or deployed backend.

---

## Notable Fixes Along the Way

Kept here as a reference in case similar issues resurface:

- **`tsconfig.json` module resolution:** the NestJS CLI scaffold defaulted to `"module": "nodenext"` with `"type": "module"` in `package.json`, which requires explicit `.js` extensions on every relative import. Switched to `"module": "commonjs"` / `"moduleResolution": "node"` to match standard NestJS conventions.
- **`PassportModule` circular DI error:** guards used in feature modules (`CarsModule`, `BookingsModule`, `UsersModule`) need `AuthModule` imported directly in each of them — importing it only in one place doesn't propagate `PassportModule`'s providers app-wide. `AuthModule` also needed `PassportModule.register({ defaultStrategy: 'jwt' })` instead of the bare `PassportModule` import, since the bare form provides nothing.
- **Circular module dependency (`UsersModule` ↔ `AuthModule`):** resolved with `forwardRef()` on both sides.
- **TypeORM `select` option:** newer TypeORM expects an object map (`{ id: true, ... }`), not an array of column names, when excluding fields like `password` from query results.
- **Cars visibility bug:** the cars endpoint filtered `isAvailable: true` unconditionally, which meant marking a car "unavailable" from the admin panel made it permanently invisible to admin management too. Added an `includeUnavailable` query flag used only by the admin fleet view.
- **AuthPage rendering broken after an AI-assisted redesign:** a UI rewrite introduced custom class names (e.g. `auth-header`, `auth-input-wrap`) with no matching CSS defined anywhere — Tailwind only generates styles for its own utility classes, so the whole page rendered unstyled. Rebuilt the page using plain Tailwind utility classes, consistent with the rest of the codebase.

---

## Known Limitations / Not Yet Implemented

This is an evolving project — the following are intentionally left for future work:

- **Reviews** on the car details page are static sample content (no reviews backend exists yet)
- **Wishlist/favorites** — not implemented
- **Payment gateway integration** — bookings are recorded but no real payment is processed
- **Email notifications** (booking confirmations, cancellations) — not implemented
- **Invoice/PDF generation** — not implemented
- **AI features** (originally planned: chatbot assistant, natural-language search, smart recommendations via NVIDIA Nemotron) — not yet built
- A few homepage marketing stats ("Serving 12 cities", "4,200+ trips completed") are static copy, not derived from real data
- Password reset / "Forgot password" flow is present in the UI but not functional yet

---

## Roadmap (Future Expansion)

Planned next, roughly in priority order:
1. AI-powered features using NVIDIA Nemotron (chatbot assistant, natural-language search → filters, smart car recommendations)
2. Real reviews system (submit + display, tied to completed bookings)
3. Payment gateway integration (Stripe/local gateway sandbox)
4. Email notifications for booking lifecycle events
5. Wishlist/favorites for customers
6. Booking invoice as downloadable PDF
7. Forgot-password flow

---

## Notes

- Passwords are hashed with bcrypt and never returned in any API response.
- All admin-only routes are protected both in the frontend (route guards) and the backend (JWT + role guards) — frontend guards are for UX only; the backend is the actual security boundary.
- Business fees (driver/insurance/service) are stored in the database and editable by admins — booking price estimates shown to customers are fetched live from the same source the backend uses to calculate the final charge, so they always match.
