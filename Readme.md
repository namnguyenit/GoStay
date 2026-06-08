# GoStay

A microservices-based accommodation booking platform built with Spring Boot and Node.js.

## Architecture

| Service | Port | Language | Database |
|---------|------|----------|----------|
| **APIGateway** | 5000 | Node.js/Express | — |
| **Identity** | 8080 | Java/Spring Boot | `auth_db` |
| **CatalogandListing** | 8082 | Java/Spring Boot | `cataloglisting` |
| **BookingandInventory** | 8083 | Java/Spring Boot | `bookinginventory` |
| **CartandOrder** | 8084 | Java/Spring Boot | `cartorder` |
| **PaymentandWallet** | 8085 | Java/Spring Boot | `paymentwallet` |
| **cloudinary-service** | 5001 | Node.js | — |
| **search-and-recommendation** | — | — | — |
| **front_end** | — | — | — |

## Services Overview

### APIGateway (5000)
Reverse proxy with rate limiting, JWT verification, user ban check, and internal token stripping.

### Identity (8080)
Authentication, registration, JWT issuance via JWKS, user/profile management, role management (user/host/enterprise/admin).

### CatalogandListing (8082)
Listing CRUD, reviews, landmarks, host suggestions, admin approval workflows.

### BookingandInventory (8083)
Inventory management, availability calendars, lock/confirm/cancel booking slots, occupancy stats.

### CartandOrder (8084)
Cart management, checkout flow, order history, server-side price validation via FeignClient.

### PaymentandWallet (8085)
Payment QR generation, SePay webhook (HMAC/API-key auth), payout management, payment scheduling.

### cloudinary-service (5001)
Media upload/delete with role-based ownership scoping.

### search-and-recommendation
Search and recommendation engine.

## Internal Communication

Services communicate via FeignClient with `X-Internal-Service-Token` header. The Gateway strips this header from external requests.

```
Catalog → Booking (init inventory)
Cart → Booking (lock/confirm/cancel)
Payment → Cart (payment success/fail)
Gateway → Identity (user ban check)
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL (one database per service)
- Cloudinary account for media service
- SePay account for payment webhooks

### Configuration

Each service uses `.env` or `application.properties` for configuration. Key variables:

```
# APIGateway
INTERNAL_SERVICE_TOKEN=your-internal-token

# Identity
ADMIN_BOOTSTRAP_ENABLED=false
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=StrongPassword123!

# Payment
SEPAY_WEBHOOK_AUTH_MODE=HMAC_SHA256
SEPAY_WEBHOOK_SECRET=your-sepay-secret

# Cloudinary
CLOUDINARY_URL=cloudinary://...
```

### Run all services

```bash
# Start Identity + APIGateway + Cloudinary
./start-all.sh

# Or start each service individually
cd APIGateway && npm start
cd Identity && ./mvnw spring-boot:run
# ... same for other services
```

## API Routes

Public endpoints:
- `POST /api/v1/auth/login`, `POST /api/v1/auth/register`
- `GET /api/v1/catalog/listings/{id}`
- `GET /api/v1/public/inventory/listings/{id}/availability`
- `POST /api/v1/public/payments/sepay-webhook`

Authenticated endpoints behind Gateway (require JWT):
- User profile: `/api/v1/me/**`
- Cart/Order: `/api/v1/carts/**`, `/api/v1/orders/**`
- Host: `/api/v1/catalog/host/**`, `/api/v1/host/inventory/**`
- Admin: `/api/v1/admin/**`
- Payments: `/api/v1/payments/**`

Internal endpoints (`/api/v1/internal/**`) are not exposed through Gateway.

## Tech Stack

- **Backend**: Spring Boot 3, Spring Security, Spring Data JPA, FeignClient
- **Gateway**: Node.js, Express, http-proxy-middleware
- **Auth**: JWT + JWKS (RS256)
- **Database**: PostgreSQL (one DB per service)
- **Media**: Cloudinary
- **Payment**: SePay (QR code + webhook)
