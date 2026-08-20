# Vehicle Rental Management Backend

A TypeScript REST API for a vehicle rental company. Staff can log in, manage vehicles, create rentals safely, and view monthly vehicle-wise rental reports.

## Technology

- Node.js, TypeScript, Express 5
- PostgreSQL, Knex
- JWT, bcrypt, Joi
- Multer for local vehicle-photo storage
- ESLint and Prettier

## Features

- JWT-protected vehicle, rental, and report APIs
- Class-based module structure: controller → service → repository
- Vehicle CRUD with photo upload, pagination, category filter, name search, and soft delete
- Rental CRUD with server-side amount calculation
- Inclusive rental duration: a same-day rental counts as one day
- Overlap prevention for active (`booked`, `ongoing`) rentals
- PostgreSQL transaction plus `FOR UPDATE` locking to prevent concurrent double-booking
- Monthly vehicle-wise rental reports, including month-boundary revenue allocation
- Consistent validation, upload, database, 404, and global error responses

## Prerequisites

- Node.js 18 or later
- pnpm
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a PostgreSQL database named `vehicle_rental_management`.

3. Copy `.env.example` to `.env` and set your PostgreSQL credentials and JWT secret.

4. Confirm the database connection:

   ```bash
   pnpm db:check
   ```

5. Create the schema and sample data:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

6. Start the development server:

   ```bash
   pnpm dev
   ```

The API runs at `http://localhost:5000` by default.

## Environment Variables

| Variable         | Description                          |
| ---------------- | ------------------------------------ |
| `PORT`           | API port; defaults to `5000`.        |
| `DATABASE_URL`   | PostgreSQL connection string.        |
| `DB_POOL_MIN`    | Minimum Knex connection-pool size.   |
| `DB_POOL_MAX`    | Maximum Knex connection-pool size.   |
| `JWT_SECRET`     | Secret used to sign and verify JWTs. |
| `JWT_EXPIRES_IN` | JWT duration, for example `1d`.      |
| `UPLOAD_PATH`    | Local directory for vehicle images.  |

## Seeded Staff Account

| Field    | Value                     |
| -------- | ------------------------- |
| Email    | `admin@vehiclerental.com` |
| Password | `Admin@12345`             |

## API Summary

Authentication is required for every endpoint except login. Send the access token as:

```http
Authorization: Bearer <token>
```

| Method | Endpoint                                                                                        | Description                                                                  |
| ------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| POST   | `/auth/login`                                                                                   | Staff login and JWT generation.                                              |
| GET    | `/vehicles?page=1&limit=10&category=Sedan&search=Toyota`                                        | List active vehicles. Filters are optional.                                  |
| GET    | `/vehicles/:id`                                                                                 | Get one active vehicle.                                                      |
| POST   | `/vehicles`                                                                                     | Create a vehicle; accepts JSON or multipart form-data with optional `photo`. |
| PUT    | `/vehicles/:id`                                                                                 | Update a vehicle and optionally replace its photo.                           |
| DELETE | `/vehicles/:id`                                                                                 | Soft delete a vehicle.                                                       |
| GET    | `/rentals?page=1&limit=10&vehicle_id=1&status=booked&start_date=2026-08-01&end_date=2026-08-31` | List rentals. Filters are optional.                                          |
| GET    | `/rentals/:id`                                                                                  | Get one rental.                                                              |
| POST   | `/rentals`                                                                                      | Create a rental; total amount is calculated on the server.                   |
| PUT    | `/rentals/:id`                                                                                  | Update a rental or set `status` to `cancelled`.                              |
| DELETE | `/rentals/:id`                                                                                  | Permanently delete a rental.                                                 |
| GET    | `/reports/rentals?month=YYYY-MM&vehicle_id=1`                                                   | Monthly vehicle-wise rental report. `vehicle_id` is optional.                |

## Example Requests

### Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@vehiclerental.com",
  "password": "Admin@12345"
}
```

### Create Rental

```http
POST /rentals
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "vehicle_id": 1,
  "customer_name": "Nusrat Jahan",
  "customer_phone": "01710000001",
  "start_date": "2026-09-10",
  "end_date": "2026-09-12"
}
```

## Rental Availability Rules

- A vehicle cannot have overlapping `booked` or `ongoing` rentals.
- `completed` and `cancelled` rentals do not block a new booking.
- An overlap returns `409 Conflict`.
- The duration is inclusive: `start_date` equal to `end_date` is one day.
- Create rental uses a transaction and locks the target vehicle row, so concurrent identical booking requests result in one success and one conflict.

## Monthly Report Rules

- The `month` query is required and must use `YYYY-MM`.
- Reports include `booked`, `ongoing`, and `completed` rentals; `cancelled` rentals are excluded.
- For a rental crossing a month boundary, only the days inside the requested month are counted.
- Revenue is allocated proportionally by the number of in-month rental days.
- The response includes the vehicle with the highest monthly revenue.

## Quality Commands

```bash
pnpm run build
pnpm run lint
pnpm exec prettier --check .
```

## Error Format

All errors use the same structure:

```json
{
  "success": false,
  "message": "Description of the error"
}
```
