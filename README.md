# TicketPro — Premium Event Ticketing Platform

Production-ready ticket booking platform for concerts, entertainment events, museums, festivals, and live shows.

## Stack

**Frontend:** Next.js 14 App Router + TypeScript + Tailwind CSS + Framer Motion + Zustand + TanStack Query  
**Backend:** Django REST Framework + PostgreSQL + JWT Auth + Celery + Redis  
**Design:** Premium glassmorphism UI + dark/light themes + Inter font

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 16+
- Redis 7+

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and email settings

# Create database
createdb ticketpro_db

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Seed categories (run in Django shell)
python manage.py shell -c "
from apps.events.models import Category
categories = [
    {'name': 'Concerts', 'slug': 'concerts', 'type': 'concert', 'icon': '🎵', 'color': '#6366f1'},
    {'name': 'Entertainment', 'slug': 'entertainment', 'type': 'entertainment', 'icon': '🎭', 'color': '#ec4899'},
    {'name': 'Museums', 'slug': 'museums', 'type': 'museum', 'icon': '🏛️', 'color': '#f59e0b'},
    {'name': 'Festivals', 'slug': 'festivals', 'type': 'festival', 'icon': '🎉', 'color': '#10b981'},
    {'name': 'Live Shows', 'slug': 'live-shows', 'type': 'live_show', 'icon': '🎪', 'color': '#8b5cf6'},
    {'name': 'Sports', 'slug': 'sports', 'type': 'sports', 'icon': '⚽', 'color': '#ef4444'},
]
for cat in categories:
    Category.objects.get_or_create(slug=cat['slug'], defaults=cat)
print('Categories seeded!')
"

# Start development server
python manage.py runserver
```

Backend runs at: http://localhost:8000  
API Docs: http://localhost:8000/api/docs/  
Django Admin: http://localhost:8000/admin/

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Docker Deployment

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit both files with production values

# Build and start all services
docker-compose up --build -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/logout/` | Logout (blacklist refresh) |
| POST | `/api/auth/verify-otp/` | Verify email OTP |
| POST | `/api/auth/resend-otp/` | Resend OTP |
| POST | `/api/auth/forgot-password/` | Request password reset OTP |
| POST | `/api/auth/reset-password/` | Reset password with OTP |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/` | List events (filters: search, category, city, date, price) |
| GET | `/api/events/featured/` | Featured events |
| GET | `/api/events/trending/` | Trending events |
| GET | `/api/events/categories/` | All categories |
| GET | `/api/events/{slug}/` | Event detail |
| GET | `/api/events/{slug}/related/` | Related events |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/create/` | Create booking |
| GET | `/api/bookings/` | User's bookings |
| GET | `/api/bookings/{reference}/` | Booking detail |
| POST | `/api/bookings/{reference}/cancel/` | Cancel booking |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/upload/` | Upload payment proof |
| GET | `/api/payments/my/` | User's payments |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin-panel/dashboard/` | Dashboard analytics |
| GET/POST | `/api/events/admin/list/` | Manage events |
| PATCH/DELETE | `/api/events/admin/{id}/` | Update/delete event |
| GET | `/api/bookings/admin/list/` | All bookings |
| POST | `/api/bookings/admin/{ref}/confirm/` | Confirm booking |
| GET | `/api/payments/admin/list/` | All payments |
| POST | `/api/payments/admin/{id}/review/` | Approve/reject payment |
| GET | `/api/users/admin/list/` | All users |

---

## Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home — hero, featured/trending events, categories | No |
| `/events` | All events with search/filter/sort/pagination | No |
| `/events/[slug]` | Event detail — info, gallery, ticket types | No |
| `/concerts` | Concert events | No |
| `/entertainment` | Entertainment events | No |
| `/museums` | Museum events | No |
| `/login` | Login with JWT | No |
| `/register` | Register with OTP verification | No |
| `/verify-otp` | OTP verification | No |
| `/forgot-password` | Password reset request | No |
| `/booking/[slug]` | 4-step booking flow | Yes |
| `/profile` | Profile + booking history | Yes |
| `/settings` | Password change, theme | Yes |
| `/admin` | Admin dashboard + analytics | Admin |
| `/admin/events` | Event CRUD | Admin |
| `/admin/bookings` | Booking management | Admin |
| `/admin/payments` | Payment verification | Admin |
| `/admin/users` | User management | Admin |

---

## Architecture

```
ticketpro/
├── backend/
│   ├── config/           # Django project config
│   │   └── settings/     # Base, dev, prod settings
│   └── apps/
│       ├── core/         # Permissions, mixins, exceptions
│       ├── users/        # Custom user model + profile
│       ├── auth_app/     # JWT + OTP authentication
│       ├── events/       # Events, categories, tickets
│       ├── bookings/     # Booking flow
│       ├── payments/     # Payment proof upload + admin verify
│       └── adminpanel/   # Dashboard analytics
└── frontend/
    ├── app/              # Next.js App Router pages
    ├── components/       # Reusable UI components
    ├── features/         # Feature-specific logic
    ├── hooks/            # Custom React hooks
    ├── services/         # API service layer (axios)
    ├── store/            # Zustand state management
    ├── lib/              # Utils, constants, validations
    └── types/            # TypeScript type definitions
```

---

## Security Features
- JWT access + refresh token rotation with blacklisting
- OTP expiry (10 min) + rate limiting (1 per min) + max attempts (5)
- CORS protection
- SQL injection prevention (Django ORM)
- CSRF protection
- Input validation (Zod on frontend, DRF serializers on backend)
- Secure cookie storage for tokens
- Password validation (uppercase + numeric requirements)
- Role-based access control (user/admin/super_admin)
- Atomic database transactions for bookings

---

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=ticketpro_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=your_app_password
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=TicketPro
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Future Enhancements
- QR code ticket generation
- Real-time updates (WebSockets/SSE)
- Online payment gateway (Chapa, Stripe)
- Mobile app (React Native)
- Multi-language support (i18n)
- Email notification templates
- Celery task queue for async emails
- S3/CloudFront for media files
- Advanced analytics with charts
