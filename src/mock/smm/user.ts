import type { UserWallet, DashboardStats, Order, Transaction, Announcement } from '@/@types/smm'

// Mock current user wallet
export const userWallet: UserWallet = {
    userId: 'user-001',
    balance: 5548,
    totalDeposit: 314282,
    totalSpent: 308734,
    tier: 'member',
}

// Mock dashboard stats
export const dashboardStats: DashboardStats = {
    balance: 5548,
    totalDeposit: 314282,
    totalSpent: 308734,
    tier: 'member',
    totalOrders: 156,
    pendingOrders: 3,
    completedOrders: 148,
}

// Mock recent orders
export const recentOrders: Order[] = [
    {
        id: 'ord-001',
        orderId: '#ORD-001234',
        userId: 'user-001',
        serviceId: 'svc-fb-like-vn',
        serverId: 'srv-fb-like-1',
        link: 'https://facebook.com/example/posts/123456',
        quantity: 1000,
        totalPrice: 2990,
        status: 'completed',
        startCount: 500,
        createdAt: new Date('2026-02-02T10:30:00'),
        updatedAt: new Date('2026-02-02T11:45:00'),
        completedAt: new Date('2026-02-02T11:45:00'),
    },
    {
        id: 'ord-002',
        orderId: '#ORD-001235',
        userId: 'user-001',
        serviceId: 'svc-tt-view',
        serverId: 'srv-tt-view-1',
        link: 'https://tiktok.com/@user/video/789',
        quantity: 10000,
        totalPrice: 5000,
        status: 'processing',
        startCount: 1200,
        remainQuantity: 6500,
        createdAt: new Date('2026-02-02T14:00:00'),
        updatedAt: new Date('2026-02-02T15:30:00'),
    },
    {
        id: 'ord-003',
        orderId: '#ORD-001236',
        userId: 'user-001',
        serviceId: 'svc-ig-follow',
        serverId: 'srv-ig-follow-1',
        link: 'https://instagram.com/username',
        quantity: 500,
        totalPrice: 2500,
        status: 'pending',
        createdAt: new Date('2026-02-03T04:30:00'),
        updatedAt: new Date('2026-02-03T04:30:00'),
    },
    {
        id: 'ord-004',
        orderId: '#ORD-001237',
        userId: 'user-001',
        serviceId: 'svc-yt-view',
        serverId: 'srv-yt-view-1',
        link: 'https://youtube.com/watch?v=abc123',
        quantity: 5000,
        totalPrice: 40000,
        status: 'in_progress',
        startCount: 10000,
        remainQuantity: 2500,
        createdAt: new Date('2026-02-01T09:00:00'),
        updatedAt: new Date('2026-02-03T04:00:00'),
    },
]

// Mock transactions
export const transactions: Transaction[] = [
    {
        id: 'txn-001',
        transactionId: 'bf7de7e595456dbb7e1f7237a830f1',
        userId: 'user-001',
        type: 'deposit',
        amount: 105000,
        balanceAfter: 110548,
        description: 'Nạp tiền qua Vietcombank',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        createdAt: new Date('2026-01-02T00:16:06'),
    },
    {
        id: 'txn-002',
        transactionId: '69b87bd093641b16f943b80b0e0819',
        userId: 'user-001',
        type: 'deposit',
        amount: 25000,
        balanceAfter: 30548,
        description: 'Nạp tiền qua Vietcombank',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        createdAt: new Date('2025-12-31T17:38:07'),
    },
    {
        id: 'txn-003',
        transactionId: '480e4567bc648037b457de0aa021209',
        userId: 'user-001',
        type: 'deposit',
        amount: 20000,
        balanceAfter: 25548,
        description: 'Nạp tiền qua Vietcombank',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        createdAt: new Date('2025-12-30T22:17:37'),
    },
    {
        id: 'txn-004',
        transactionId: '9a2716a5c6803fa47b6b6403b9b4a',
        userId: 'user-001',
        type: 'deposit',
        amount: 50000,
        balanceAfter: 55548,
        description: 'Nạp tiền qua Vietcombank',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        createdAt: new Date('2025-12-08T00:49:48'),
    },
    {
        id: 'txn-005',
        transactionId: '88890de1c787b4b64b36853e9',
        userId: 'user-001',
        type: 'order',
        amount: -2990,
        balanceAfter: 52558,
        description: 'Thanh toán đơn hàng #ORD-001234',
        status: 'completed',
        createdAt: new Date('2026-02-02T10:30:00'),
    },
]

// Mock announcements
export const announcements: Announcement[] = [
    {
        id: 'ann-001',
        title: 'Cardssvn.com',
        content: 'Thông báo cập nhật hệ thống mới, cải thiện tốc độ xử lý đơn hàng.',
        author: 'Admin',
        isPinned: true,
        createdAt: new Date('2025-10-19T20:54:03'),
    },
    {
        id: 'ann-002',
        title: 'Lê Trọng Nghĩa',
        content: `Các Phương Thức Liên Lạc Với Mình:
- Facebook Chính: Tại Đây
- Facebook Phụ: Tại Đây
- Gmail: Nghiatrongle@gmail.com
- Zalo: Tại Đây
- Cần Gấp Thì Call Qua SĐT: 0862849283
- Link Box Zalo Chính: Tại Đây
- Link Box Zalo Phụ: Tại Đây`,
        author: 'Lê Trọng Nghĩa',
        isPinned: true,
        createdAt: new Date('2025-11-18T18:04:53'),
    },
    {
        id: 'ann-003',
        title: 'Tuyển Website Con',
        content: 'Bên Mình Cần Tuyển Website Con Số Lượng Lớn\n- Không Yêu Cầu Bằng Cấp',
        author: 'Admin',
        isPinned: false,
        createdAt: new Date('2025-10-01T13:14:21'),
    },
]

// Mock updates/notifications
export const recentUpdates = [
    {
        id: 'upd-001',
        type: 'service',
        title: 'View TikTok',
        content: '[4089] Tiktok Video Views | Max 5M | Bảo Hành Tự Động | 15 Days Auto Refill 🔥⚡',
        createdAt: new Date('2026-02-03T04:30:00'),
        timeAgo: '3 phút',
    },
    {
        id: 'upd-002',
        type: 'server',
        title: 'Thông Tin Server',
        content: 'Dịch vụ này tự động bảo hành trong vòng 15 ngày, hệ thống của chúng tôi sẽ kiểm tra video của bạn mỗi 24 giờ và tự động điền lượt xem tụt giảm. Tuy nhiên, việc bảo hành không khả dụng nếu tụt thấp hơn số với số lượng bắt đầu.',
        createdAt: new Date('2026-02-03T04:25:00'),
        timeAgo: '8 phút',
    },
    {
        id: 'upd-003',
        type: 'promotion',
        title: 'Thông Báo Dịch Vụ',
        content: 'Tiếp Tục Giảm Giá Follow Facebook 🔥',
        createdAt: new Date('2026-02-02T22:00:00'),
        timeAgo: '6 tiếng',
    },
]

export default {
    userWallet,
    dashboardStats,
    recentOrders,
    transactions,
    announcements,
    recentUpdates,
}
