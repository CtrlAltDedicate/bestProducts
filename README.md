# BestProducts Manager

A full-stack retail product management web application built for the SWE5308 Assessment Brief 002.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router v6, React Hook Form, Axios |
| Backend | Django 4.2 + Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Database | MySQL 8.0 |
| Proxy | Nginx |
| Containers | Docker + Docker Compose |
| External API | [Fakestore API](https://fakestoreapi.com) |

---

## Running Locally

### Prerequisites
- Docker Desktop (Windows) — make sure it's running
- Git

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/<username>/bestproducts.git
cd bestproducts

# 2. Environment variables are already set in .env for local dev
#    (never commit .env to git in production — use .env.example as template)

# 3. Start all services
docker-compose up --build

# 4. Open http://localhost in your browser
```

The first run takes a few minutes to build images. On subsequent runs:
```bash
docker-compose up
```

To stop:
```bash
docker-compose down
```

To wipe the database too:
```bash
docker-compose down -v
```

---

## Creating a Django Superuser (Admin Access)

```bash
docker-compose exec backend python manage.py createsuperuser
```

Then visit http://localhost/admin to access the Django admin panel.

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | None | Register new user, returns JWT tokens |
| POST | `/api/auth/login/` | None | Login, returns JWT tokens |
| POST | `/api/auth/refresh/` | None | Refresh access token |
| GET | `/api/auth/me/` | JWT | Get current user info |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products/` | JWT | List all products |
| POST | `/api/products/` | JWT | Create a product |
| GET | `/api/products/{id}/` | JWT | Get a single product |
| PUT | `/api/products/{id}/` | JWT (owner/admin) | Full update |
| PATCH | `/api/products/{id}/` | JWT (owner/admin) | Partial update |
| DELETE | `/api/products/{id}/` | JWT (owner/admin) | Delete product |
| POST | `/api/products/import_from_fakestore/` | JWT | Import from Fakestore API |

All responses follow: `{ "data": ..., "message": "..." }`

---

## Project Structure

```
bestproducts/
├── backend/          Django REST API
├── frontend/         React + Vite app
├── nginx/            Reverse proxy config
├── docker-compose.yml        Local development
├── docker-compose.prod.yml   Production
├── .env              Local environment variables (do not commit)
└── .env.example      Template for environment variables
```

---

## Security (OWASP Top 10)

- **A01 Broken Access Control** — ownership check before update/delete
- **A02 Cryptographic Failures** — Django's `create_user` hashes passwords; HTTPS in production
- **A03 Injection** — Django ORM only, no raw SQL; DRF serializers validate all input
- **A05 Misconfiguration** — `DEBUG=False` in production; secrets via env vars
- **A07 Auth Failures** — JWT with expiry; failed login attempts logged
- **A09 Logging** — Django logging captures warnings and errors
