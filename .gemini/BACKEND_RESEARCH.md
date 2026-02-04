# 🔧 Nghiên cứu Backend cho SMM Panel

**Ngày nghiên cứu:** 03/02/2026  
**Dự án:** SMM Panel - bantuongtac  
**Stack hiện tại:** Next.js 15, React 19, TypeScript, TailwindCSS 4

---

## 📋 Tổng quan dự án hiện tại

### Cấu trúc đã có:
```
src/
├── @types/smm.d.ts      # TypeScript types đầy đủ
├── app/api/             # API routes (chỉ có auth)
├── mock/smm/            # Mock data (services, categories, user)
├── server/actions/      # Server actions (auth, locale, theme)
├── services/            # API service utilities (axios)
└── middleware.ts        # Auth middleware
```

### Types đã định nghĩa:
- ✅ `ServiceCategory`, `Service`, `ServiceServer`
- ✅ `Order`, `OrderStatus`
- ✅ `Transaction`, `TransactionType`
- ✅ `UserWallet`, `DashboardStats`
- ✅ `Ticket`, `TicketReply`
- ✅ `ApiResponse<T>`, `PaginatedResponse<T>`

### Dependencies liên quan:
- `next-auth@5.0.0-beta.25` - Authentication
- `axios@1.7.7` - HTTP client
- `swr@2.3.0` - Data fetching/caching
- `zod@4.1.1` - Schema validation
- `zustand@5.0.8` - State management

---

## 🎯 Các giải pháp Backend đề xuất

### **Giải pháp 1: Supabase + Prisma (Khuyến nghị ⭐)**

**Mô tả:** Backend-as-a-Service kết hợp ORM type-safe

**Ưu điểm:**
- ✅ PostgreSQL database quản lý hoàn toàn
- ✅ Authentication tích hợp (OAuth, Email, Magic Link)
- ✅ Real-time subscriptions cho live updates
- ✅ Storage cho files/images
- ✅ Edge Functions cho custom logic
- ✅ Free tier rộng rãi
- ✅ Prisma đảm bảo type-safety end-to-end
- ✅ Dashboard quản trị có sẵn

**Nhược điểm:**
- ⚠️ Lock-in với Supabase platform
- ⚠️ Cần học API Supabase
- ⚠️ Chi phí tăng khi scale lớn

**Chi phí:**
| Plan | Giá | Database | Storage | Bandwidth |
|------|-----|----------|---------|-----------|
| Free | $0/tháng | 500MB | 1GB | 2GB |
| Pro | $25/tháng | 8GB | 100GB | 50GB |
| Team | $599/tháng | Unlimited | Unlimited | Unlimited |

**Cấu trúc đề xuất:**
```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── admin.ts       # Admin client
│   └── prisma/
│       ├── client.ts      # Prisma client
│       └── schema.prisma  # Database schema
├── app/api/
│   ├── services/
│   ├── orders/
│   ├── wallet/
│   └── tickets/
└── server/actions/
    ├── orders.ts
    ├── services.ts
    └── wallet.ts
```

---

### **Giải pháp 2: PostgreSQL + Prisma + Next.js API Routes**

**Mô tả:** Self-hosted database với ORM

**Ưu điểm:**
- ✅ Kiểm soát hoàn toàn
- ✅ Chi phí thấp (chỉ hosting)
- ✅ Không lock-in
- ✅ Tích hợp tốt với Next.js

**Nhược điểm:**
- ⚠️ Cần tự quản lý database server
- ⚠️ Tự xây authentication
- ⚠️ Không có real-time built-in

**Hosting options:**
| Provider | Free Tier | Paid |
|----------|-----------|------|
| Neon | 10GB | $19/tháng |
| Railway | 500MB | $5+/tháng |
| PlanetScale | 1B rows | $29/tháng |
| Vercel Postgres | 256MB | $20/tháng |

---

### **Giải pháp 3: Firebase + Firestore**

**Mô tả:** NoSQL database từ Google

**Ưu điểm:**
- ✅ Real-time sync tự động
- ✅ Authentication tích hợp
- ✅ SDKs cho mọi platform
- ✅ Free tier tốt

**Nhược điểm:**
- ⚠️ NoSQL không phù hợp với relational data
- ⚠️ Chi phí cao khi scale
- ⚠️ Vendor lock-in mạnh

---

### **Giải pháp 4: Custom Express/Fastify Backend (Không khuyến nghị)**

**Mô tả:** Separate backend server

**Ưu điểm:**
- ✅ Tách biệt hoàn toàn
- ✅ Linh hoạt tối đa

**Nhược điểm:**
- ⚠️ Cần thêm hosting riêng
- ⚠️ CORS handling
- ⚠️ Maintenance phức tạp
- ⚠️ Không tận dụng được Next.js Server Components

---

## 🔌 Tích hợp SMM API Providers

### Các providers phổ biến:

| Provider | API Quality | Speed | Price | Documentation |
|----------|-------------|-------|-------|---------------|
| SMMPanel.co | ⭐⭐⭐⭐ | Fast | Low | Good |
| YoYoMedia | ⭐⭐⭐⭐⭐ | Fast | Medium | Excellent |
| GodSMM | ⭐⭐⭐⭐ | Fast | Low | Good |
| BoostProvider | ⭐⭐⭐ | Medium | Low | Basic |
| NawabSMM | ⭐⭐⭐⭐ | Fast | Medium | Excellent |

### API Standard (hầu hết providers):

```typescript
// Common API Endpoints
interface SMMProviderAPI {
  // Get balance
  balance(): Promise<{ balance: string; currency: string }>
  
  // Get services list
  services(): Promise<ProviderService[]>
  
  // Create order
  order(params: {
    service: string    // Service ID
    link: string       // Target URL
    quantity: number   // Amount
  }): Promise<{ order: string }>  // Return order ID
  
  // Check order status
  status(params: {
    order: string
  }): Promise<{
    status: 'Pending' | 'Processing' | 'In progress' | 'Completed' | 'Partial' | 'Cancelled'
    charge: string
    start_count: string
    remains: string
  }>
  
  // Multi-order status
  orders(params: {
    orders: string  // Comma-separated IDs
  }): Promise<Record<string, OrderStatus>>
  
  // Cancel order (if supported)
  cancel(params: { order: string }): Promise<void>
  
  // Refill order (if supported)  
  refill(params: { order: string }): Promise<{ refill: string }>
}

// Example request
const response = await fetch('https://provider.com/api/v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'YOUR_API_KEY',
    action: 'order',
    service: 1234,
    link: 'https://facebook.com/post/...',
    quantity: 1000
  })
})
```

---

## 📊 Database Schema đề xuất (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== USER & AUTH =====
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  avatar        String?
  password      String?     // Hashed
  tier          UserTier    @default(MEMBER)
  isActive      Boolean     @default(true)
  
  wallet        Wallet?
  orders        Order[]
  transactions  Transaction[]
  tickets       Ticket[]
  apiKeys       ApiKey[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([email])
}

enum UserTier {
  MEMBER
  VIP
  RESELLER
  AGENCY
}

// ===== WALLET =====
model Wallet {
  id           String      @id @default(cuid())
  userId       String      @unique
  user         User        @relation(fields: [userId], references: [id])
  
  balance      Decimal     @default(0) @db.Decimal(15, 2)
  totalDeposit Decimal     @default(0) @db.Decimal(15, 2)
  totalSpent   Decimal     @default(0) @db.Decimal(15, 2)
  
  updatedAt    DateTime    @updatedAt
}

// ===== SERVICE CATEGORIES =====
model ServiceCategory {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  icon        String
  color       String
  description String?
  isActive    Boolean     @default(true)
  order       Int         @default(0)
  
  services    Service[]
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

// ===== SERVICES =====
model Service {
  id           String           @id @default(cuid())
  categoryId   String
  category     ServiceCategory  @relation(fields: [categoryId], references: [id])
  
  name         String
  slug         String           @unique
  type         ServiceType
  description  String
  instructions String?          @db.Text
  isActive     Boolean          @default(true)
  order        Int              @default(0)
  
  servers      ServiceServer[]
  orders       Order[]
  faqs         ServiceFAQ[]
  
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  
  @@index([categoryId])
  @@index([slug])
}

enum ServiceType {
  LIKE
  FOLLOW
  COMMENT
  SHARE
  VIEW
  SUBSCRIBER
  REACTION
}

// ===== SERVICE SERVERS (Options) =====
model ServiceServer {
  id            String      @id @default(cuid())
  serviceId     String
  service       Service     @relation(fields: [serviceId], references: [id])
  
  name          String
  price         Decimal     @db.Decimal(10, 2)  // Per 1000
  minQuantity   Int
  maxQuantity   Int
  estimatedTime String
  speed         String
  quality       String
  isRecommended Boolean     @default(false)
  isActive      Boolean     @default(true)
  
  // Provider integration
  providerKey   String?     // Which provider
  providerServiceId String? // Service ID on provider
  
  orders        Order[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([serviceId])
}

// ===== SERVICE FAQ =====
model ServiceFAQ {
  id         String   @id @default(cuid())
  serviceId  String
  service    Service  @relation(fields: [serviceId], references: [id])
  
  question   String
  answer     String   @db.Text
  order      Int      @default(0)
}

// ===== ORDERS =====
model Order {
  id            String      @id @default(cuid())
  orderId       String      @unique  // Display ID: ORD-XXXXXX
  
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  serviceId     String
  service       Service     @relation(fields: [serviceId], references: [id])
  
  serverId      String
  server        ServiceServer @relation(fields: [serverId], references: [id])
  
  link          String
  quantity      Int
  totalPrice    Decimal     @db.Decimal(15, 2)
  status        OrderStatus @default(PENDING)
  
  // Provider tracking
  providerOrderId String?
  startCount      Int?
  remainQuantity  Int?
  
  note          String?
  metadata      Json?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  completedAt   DateTime?
  
  @@index([userId])
  @@index([status])
  @@index([orderId])
}

enum OrderStatus {
  PENDING
  PROCESSING
  IN_PROGRESS
  COMPLETED
  PARTIAL
  CANCELLED
  REFUNDED
}

// ===== TRANSACTIONS =====
model Transaction {
  id             String          @id @default(cuid())
  transactionId  String          @unique  // TXN-XXXXXX
  
  userId         String
  user           User            @relation(fields: [userId], references: [id])
  
  type           TransactionType
  amount         Decimal         @db.Decimal(15, 2)
  balanceAfter   Decimal         @db.Decimal(15, 2)
  description    String
  
  paymentMethod  PaymentMethod?
  status         TransactionStatus @default(PENDING)
  metadata       Json?
  
  createdAt      DateTime        @default(now())
  
  @@index([userId])
  @@index([type])
}

enum TransactionType {
  DEPOSIT
  ORDER
  REFUND
  BONUS
  WITHDRAWAL
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
}

enum PaymentMethod {
  BANK_TRANSFER
  MOMO
  ZALOPAY
  CARD
  CRYPTO
}

// ===== SUPPORT TICKETS =====
model Ticket {
  id         String        @id @default(cuid())
  ticketId   String        @unique  // TKT-XXXXXX
  
  userId     String
  user       User          @relation(fields: [userId], references: [id])
  
  subject    String
  message    String        @db.Text
  status     TicketStatus  @default(OPEN)
  priority   TicketPriority @default(MEDIUM)
  
  replies    TicketReply[]
  
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  
  @@index([userId])
  @@index([status])
}

model TicketReply {
  id         String   @id @default(cuid())
  ticketId   String
  ticket     Ticket   @relation(fields: [ticketId], references: [id])
  
  userId     String
  isAdmin    Boolean  @default(false)
  message    String   @db.Text
  
  createdAt  DateTime @default(now())
}

enum TicketStatus {
  OPEN
  REPLIED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// ===== API KEYS (for resellers) =====
model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  key       String   @unique
  name      String
  isActive  Boolean  @default(true)
  lastUsed  DateTime?
  
  createdAt DateTime @default(now())
  
  @@index([key])
}

// ===== SMM PROVIDERS =====
model SMMProvider {
  id           String   @id @default(cuid())
  name         String
  apiUrl       String
  apiKey       String   // Encrypted
  isActive     Boolean  @default(true)
  balance      Decimal? @db.Decimal(15, 2)
  lastChecked  DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ===== ANNOUNCEMENTS =====
model Announcement {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  author    String
  isPinned  Boolean  @default(false)
  isActive  Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ===== LUCKY WHEEL =====
model LuckyWheelSpin {
  id        String   @id @default(cuid())
  userId    String
  prize     String
  amount    Decimal  @db.Decimal(15, 2)
  
  createdAt DateTime @default(now())
  
  @@index([userId])
}

model LuckyWheelConfig {
  id          String   @id @default(cuid())
  prizes      Json     // Array of prizes with probabilities
  spinsPerDay Int      @default(3)
  spinCost    Decimal  @db.Decimal(10, 2) @default(0)
  isActive    Boolean  @default(true)
}
```

---

## 🛠 Architecture đề xuất

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                  │
│  Next.js 15 (App Router) + React 19 + TypeScript                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   Pages     │  │ Components  │  │   Hooks     │               │
│  │  (RSC/RCC)  │  │             │  │  (SWR/etc)  │               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │
│         │                │                │                       │
│         └────────────────┴────────────────┘                       │
│                          │                                        │
├──────────────────────────┼────────────────────────────────────────┤
│                    API LAYER                                      │
│                          │                                        │
│  ┌───────────────────────┴────────────────────────────┐          │
│  │              Next.js API Routes                     │          │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │          │
│  │  │ /orders │ │/services│ │ /wallet │ │/tickets │   │          │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │          │
│  │       │           │           │           │        │           │
│  │       └───────────┴───────────┴───────────┘        │           │
│  │                       │                            │           │
│  │              ┌────────┴────────┐                   │           │
│  │              │  Server Actions │                   │           │
│  │              │  (createOrder,  │                   │           │
│  │              │   getServices)  │                   │           │
│  │              └────────┬────────┘                   │           │
│  └───────────────────────┼────────────────────────────┘           │
│                          │                                        │
├──────────────────────────┼────────────────────────────────────────┤
│                    DATA LAYER                                     │
│                          │                                        │
│  ┌───────────────────────┴────────────────────────────┐           │
│  │                 Prisma ORM                          │           │
│  │           (Type-safe queries)                       │           │
│  └───────────────────────┬────────────────────────────┘           │
│                          │                                        │
│  ┌───────────────────────┴────────────────────────────┐           │
│  │          Supabase PostgreSQL                        │           │
│  │   ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │           │
│  │   │ Users │ │Orders │ │Service│ │Tickets│          │           │
│  │   └───────┘ └───────┘ └───────┘ └───────┘          │           │
│  └────────────────────────────────────────────────────┘           │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│                   EXTERNAL SERVICES                               │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │
│  │ SMM Panel  │  │  Payment   │  │   Auth     │                  │
│  │ Providers  │  │  Gateways  │  │ (NextAuth) │                  │
│  │(YoYoMedia) │  │(MoMo,Bank) │  │            │                  │
│  └────────────┘  └────────────┘  └────────────┘                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc thư mục Backend đề xuất

```
src/
├── app/
│   └── api/
│       ├── auth/[...nextauth]/    # NextAuth routes
│       ├── services/
│       │   ├── route.ts           # GET /api/services
│       │   └── [id]/route.ts      # GET /api/services/:id
│       ├── orders/
│       │   ├── route.ts           # GET, POST /api/orders
│       │   └── [id]/
│       │       ├── route.ts       # GET, PATCH /api/orders/:id
│       │       └── status/route.ts # GET /api/orders/:id/status
│       ├── wallet/
│       │   ├── route.ts           # GET /api/wallet
│       │   ├── deposit/route.ts   # POST /api/wallet/deposit
│       │   └── history/route.ts   # GET /api/wallet/history
│       ├── tickets/
│       │   ├── route.ts           # GET, POST /api/tickets
│       │   └── [id]/
│       │       ├── route.ts       # GET, PATCH /api/tickets/:id
│       │       └── replies/route.ts # GET, POST replies
│       ├── user/
│       │   ├── route.ts           # GET, PATCH /api/user
│       │   └── api-keys/route.ts  # API keys management
│       ├── admin/                  # Admin endpoints
│       │   ├── users/route.ts
│       │   ├── orders/route.ts
│       │   └── settings/route.ts
│       └── reseller/              # Reseller API
│           └── v1/
│               ├── services/route.ts
│               ├── orders/route.ts
│               └── balance/route.ts
│
├── lib/
│   ├── prisma/
│   │   ├── client.ts              # Prisma client singleton
│   │   └── extensions/            # Custom Prisma extensions
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── admin.ts               # Admin client
│   ├── providers/                 # SMM Providers
│   │   ├── base.ts                # Base provider class
│   │   ├── yoyomedia.ts
│   │   ├── smmpanel.ts
│   │   └── index.ts               # Provider factory
│   ├── payments/                  # Payment integrations
│   │   ├── momo.ts
│   │   ├── zalopay.ts
│   │   └── bank.ts
│   └── utils/
│       ├── auth.ts                # Auth utilities
│       ├── validation.ts          # Zod schemas
│       └── helpers.ts             # Common helpers
│
├── server/
│   └── actions/
│       ├── orders.ts              # Order server actions
│       ├── services.ts            # Service server actions
│       ├── wallet.ts              # Wallet server actions
│       └── tickets.ts             # Ticket server actions
│
├── hooks/
│   ├── useOrders.ts               # SWR hook for orders
│   ├── useServices.ts             # SWR hook for services
│   ├── useWallet.ts               # SWR hook for wallet
│   └── useRealtime.ts             # Supabase realtime hook
│
└── types/
    ├── api.ts                     # API request/response types
    └── prisma.ts                  # Prisma generated types
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Authentication Flow                        │
└──────────────────────────────────────────────────────────────┘

1. USER REGISTRATION
   ┌─────────┐     ┌──────────┐     ┌──────────┐
   │  User   │────▶│ Register │────▶│ NextAuth │
   │         │     │   Form   │     │          │
   └─────────┘     └──────────┘     └────┬─────┘
                                         │
                   ┌─────────────────────┘
                   ▼
   ┌──────────────────────┐     ┌──────────────┐
   │   Create User +      │────▶│  Create      │
   │   Wallet in DB       │     │  Session     │
   └──────────────────────┘     └──────────────┘

2. LOGIN FLOW
   ┌─────────┐     ┌──────────┐     ┌──────────┐
   │  User   │────▶│  Login   │────▶│ NextAuth │
   │         │     │   Form   │     │ Verify   │
   └─────────┘     └──────────┘     └────┬─────┘
                                         │
                   ┌─────────────────────┘
                   ▼
   ┌──────────────────────┐     ┌──────────────┐
   │   Validate Password  │────▶│  JWT Token   │
   │   (bcrypt compare)   │     │  + Session   │
   └──────────────────────┘     └──────────────┘

3. API REQUEST FLOW
   ┌─────────┐     ┌──────────┐     ┌──────────┐
   │ Client  │────▶│   API    │────▶│  Auth    │
   │ Request │     │  Route   │     │Middleware│
   └─────────┘     └──────────┘     └────┬─────┘
                                         │
                   ┌─────────────────────┘
                   ▼
   ┌──────────────────────┐     ┌──────────────┐
   │  Verify JWT/Session  │────▶│  Process     │
   │  Get User from DB    │     │  Request     │
   └──────────────────────┘     └──────────────┘
```

---

## 💳 Payment Integration Flow

```
DEPOSIT FLOW:

1. User chọn số tiền + payment method
2. System tạo Transaction (pending)
3. Redirect đến payment gateway (MoMo/ZaloPay/Bank)
4. Payment gateway callback
5. Verify callback signature
6. Update Transaction status
7. Update User wallet balance
8. Send notification

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶│ Create  │───▶│ Gateway │───▶│Callback │
│ Deposit │    │ Pending │    │Redirect │    │ Verify  │
└─────────┘    │   TXN   │    └─────────┘    └────┬────┘
               └─────────┘                        │
                                                  ▼
                              ┌─────────┐    ┌─────────┐
                              │ Update  │◀───│ Update  │
                              │ Balance │    │   TXN   │
                              └─────────┘    └─────────┘
```

---

## 📦 Order Processing Flow

```
ORDER FLOW:

1. User submit order (link, quantity, server)
2. Validate balance >= total price
3. Deduct from wallet (Transaction: ORDER)
4. Create Order (status: PENDING)
5. Send to SMM Provider API
6. Update Order with providerOrderId
7. Background job: Poll status from provider
8. Update Order status
9. If partial: Create refund transaction

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶│Validate │───▶│ Deduct  │───▶│ Create  │
│ Submit  │    │ Balance │    │  Wallet │    │  Order  │
└─────────┘    └─────────┘    └─────────┘    └────┬────┘
                                                  │
                                                  ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Update  │◀───│  Poll   │◀───│ Update  │◀───│  Send   │
│ Status  │    │ Status  │    │Order ID │    │Provider │
└─────────┘    │ (CRON)  │    └─────────┘    │   API   │
               └─────────┘                    └─────────┘
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (1-2 tuần)
- [ ] Setup Supabase project
- [ ] Configure Prisma với database schema
- [ ] Setup NextAuth với Supabase
- [ ] Tạo base API routes
- [ ] Migrate mock data sang database

### Phase 2: Core Features (2-3 tuần)  
- [ ] User wallet management
- [ ] Service listing từ database
- [ ] Order creation flow
- [ ] Transaction history

### Phase 3: Provider Integration (1-2 tuần)
- [ ] Create provider abstraction layer
- [ ] Integrate 1-2 SMM providers
- [ ] Order submission to providers
- [ ] Status polling background job

### Phase 4: Payment (1-2 tuần)
- [ ] Bank transfer integration
- [ ] MoMo integration
- [ ] ZaloPay integration
- [ ] Callback handling

### Phase 5: Advanced Features (2-3 tuần)
- [ ] Reseller API
- [ ] Admin dashboard
- [ ] Real-time updates
- [ ] Analytics & reporting

---

## ⚙️ Environment Variables cần thêm

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # For Prisma migrations

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# SMM Providers
YOYOMEDIA_API_KEY="..."
SMMPANEL_API_KEY="..."

# Payments
MOMO_PARTNER_CODE="..."
MOMO_ACCESS_KEY="..."
MOMO_SECRET_KEY="..."

ZALOPAY_APP_ID="..."
ZALOPAY_KEY1="..."
ZALOPAY_KEY2="..."

# Other
CRON_SECRET="..."  # For background jobs
ENCRYPTION_KEY="..."  # For sensitive data
```

---

## 📋 Kết luận & Khuyến nghị

### Giải pháp đề xuất: **Supabase + Prisma**

**Lý do:**
1. ✅ Setup nhanh, free tier đủ để start
2. ✅ Type-safety từ Prisma
3. ✅ Real-time built-in cho live updates
4. ✅ Auth đã có sẵn
5. ✅ Tích hợp tốt với Next.js 15
6. ✅ Không cần quản lý infrastructure

### Bước tiếp theo khi sẵn sàng triển khai:
1. Tạo project Supabase
2. Setup Prisma với schema trên
3. Migrate database
4. Tạo API routes theo pattern đề xuất
5. Integrate một SMM provider làm PoC
6. Test với các flow chính

---

*Tài liệu này sẽ được cập nhật khi có thêm yêu cầu hoặc thay đổi.*
