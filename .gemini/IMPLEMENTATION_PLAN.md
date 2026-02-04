# 📋 Kế Hoạch Xây Dựng Website Bán Dịch Vụ Mạng Xã Hội

## 🎯 Tổng Quan Dự Án

**Tên dự án**: BanTuongTac - Website bán dịch vụ tăng tương tác mạng xã hội
**Mẫu tham khảo**: sub1svn.com
**Nền tảng**: Next.js 15 + React 19 + TailwindCSS 4 (từ Ecme template)

---

## 📊 Các Module Chính

### 1. 🔐 Module Authentication (Có sẵn - Cần customize)
- [x] Đăng nhập
- [x] Đăng ký
- [x] Quên mật khẩu
- [x] Reset mật khẩu
- [ ] Xác thực email/số điện thoại
- [ ] Đăng nhập Google/Facebook

### 2. 💰 Module Ví Điện Tử
- [ ] Hiển thị số dư
- [ ] Nạp tiền (Momo, Ngân hàng, Card điện thoại)
- [ ] Lịch sử nạp tiền
- [ ] Lịch sử giao dịch

### 3. 📦 Module Dịch Vụ
- [ ] Danh mục dịch vụ (Facebook, Instagram, TikTok, YouTube, Shopee)
- [ ] Danh sách dịch vụ theo từng platform
- [ ] Chi tiết dịch vụ (giá, mô tả, thời gian hoàn thành)
- [ ] Tìm kiếm dịch vụ

### 4. 🛒 Module Đặt Hàng
- [ ] Form đặt hàng (link, số lượng, ghi chú)
- [ ] Tính giá tự động
- [ ] Xác nhận và thanh toán
- [ ] Lịch sử đơn hàng
- [ ] Chi tiết đơn hàng
- [ ] Trạng thái đơn hàng (Pending, Processing, Completed, Cancelled)

### 5. 📊 Module Dashboard
- [ ] Thống kê tổng quan
- [ ] Số đơn hàng
- [ ] Số tiền đã chi
- [ ] Biểu đồ thống kê

### 6. 🎫 Module Hỗ Trợ
- [ ] Tạo ticket
- [ ] Danh sách ticket
- [ ] Chi tiết ticket
- [ ] Chat với admin

### 7. 👤 Module Profile
- [ ] Thông tin cá nhân
- [ ] Đổi mật khẩu
- [ ] API Key (cho reseller)

### 8. 🔧 Module Admin (Bonus)
- [ ] Quản lý người dùng
- [ ] Quản lý dịch vụ
- [ ] Quản lý đơn hàng
- [ ] Cấu hình thanh toán
- [ ] Thống kê doanh thu

---

## 🎨 Thiết Kế UI/UX

### Color Palette (Gợi ý)
```css
--primary: #6366f1;        /* Indigo - Màu chủ đạo */
--primary-deep: #4f46e5;
--secondary: #10b981;      /* Emerald - Thành công */
--accent: #f59e0b;         /* Amber - Highlight */
--background: #0f172a;     /* Dark background */
--surface: #1e293b;        /* Card background */
```

### Platforms Icons & Colors
- Facebook: #1877F2
- Instagram: Gradient #833AB4 → #FD1D1D → #FCAF45
- TikTok: #000000 + #00F2EA
- YouTube: #FF0000
- Shopee: #EE4D2D

---

## 📁 Cấu Trúc Thư Mục Mới

```
src/
├── app/
│   ├── (auth-pages)/          # Giữ nguyên
│   ├── (protected-pages)/
│   │   ├── dashboard/         # Trang chủ sau đăng nhập
│   │   ├── services/          # Danh sách dịch vụ
│   │   │   └── [category]/    # Dịch vụ theo platform
│   │   ├── orders/            # Đơn hàng
│   │   │   ├── new/           # Đặt hàng mới
│   │   │   ├── history/       # Lịch sử đơn hàng
│   │   │   └── [id]/          # Chi tiết đơn hàng
│   │   ├── wallet/            # Ví tiền
│   │   │   ├── deposit/       # Nạp tiền
│   │   │   └── history/       # Lịch sử
│   │   ├── tickets/           # Hỗ trợ
│   │   └── profile/           # Thông tin cá nhân
│   └── api/
│       ├── services/          # API dịch vụ
│       ├── orders/            # API đơn hàng
│       ├── wallet/            # API ví
│       └── payment/           # API thanh toán
├── components/
│   ├── smm/                   # Components mới cho SMM
│   │   ├── ServiceCard/
│   │   ├── OrderForm/
│   │   ├── WalletCard/
│   │   ├── PlatformIcon/
│   │   ├── OrderStatusBadge/
│   │   └── PricingCalculator/
│   └── ... (giữ nguyên UI components)
├── services/
│   ├── smmService.ts          # Service xử lý API
│   ├── orderService.ts
│   └── walletService.ts
└── @types/
    └── smm.d.ts               # Type definitions cho SMM
```

---

## 🗄️ Database Schema (Gợi ý)

### Users (Mở rộng từ auth)
```typescript
interface User {
  id: string
  email: string
  phone?: string
  balance: number           // Số dư ví
  totalSpent: number        // Tổng đã chi
  apiKey?: string           // Cho reseller
  role: 'user' | 'admin'
  createdAt: Date
}
```

### Services (Dịch vụ)
```typescript
interface Service {
  id: string
  name: string              // "Tăng Like Facebook"
  category: string          // "facebook" | "instagram" | "tiktok" | "youtube" | "shopee"
  type: string              // "like" | "follow" | "comment" | "share" | "view"
  price: number             // Giá per 1000
  minQuantity: number
  maxQuantity: number
  description: string
  estimatedTime: string     // "1-24 giờ"
  isActive: boolean
}
```

### Orders (Đơn hàng)
```typescript
interface Order {
  id: string
  userId: string
  serviceId: string
  link: string              // Link cần tăng tương tác
  quantity: number
  totalPrice: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'partial'
  startCount?: number
  remainQuantity?: number
  createdAt: Date
  updatedAt: Date
}
```

### Transactions (Giao dịch ví)
```typescript
interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'order' | 'refund'
  amount: number
  balance: number           // Số dư sau giao dịch
  description: string
  status: 'pending' | 'completed' | 'failed'
  paymentMethod?: string    // 'momo' | 'bank' | 'card'
  createdAt: Date
}
```

---

## 🚀 Thứ Tự Triển Khai

### Phase 1: Setup & Basic Structure (Day 1-2)
1. [ ] Cấu hình lại navigation menu
2. [ ] Tạo cấu trúc thư mục mới
3. [ ] Thiết kế color scheme & theme
4. [ ] Tạo mock data cho services

### Phase 2: Core Pages (Day 3-5)
1. [ ] Dashboard page
2. [ ] Services listing page
3. [ ] Service category pages
4. [ ] Order form component

### Phase 3: Wallet System (Day 6-7)
1. [ ] Wallet balance display
2. [ ] Deposit page
3. [ ] Transaction history

### Phase 4: Order Management (Day 8-10)
1. [ ] Order creation flow
2. [ ] Order history page
3. [ ] Order detail page
4. [ ] Order status tracking

### Phase 5: Support & Profile (Day 11-12)
1. [ ] Ticket system
2. [ ] Profile page
3. [ ] API key management

### Phase 6: Polish & Testing (Day 13-14)
1. [ ] Responsive design check
2. [ ] Animation & UX improvements
3. [ ] Error handling
4. [ ] Loading states

---

## 📝 Ghi Chú

- Template Ecme đã có sẵn nhiều UI components, cần tận dụng tối đa
- Cần integrate với payment gateway (Momo, Bank transfer)
- Có thể cần API từ SMM panel bên thứ 3 để xử lý đơn hàng thực tế
- Prioritize mobile-first design vì đa số user dùng điện thoại

---

## ✅ Bắt Đầu Ngay

Để bắt đầu, chạy lệnh:
```bash
npm install
npm run dev
```

Sau đó thực hiện theo từng phase trong kế hoạch trên.
