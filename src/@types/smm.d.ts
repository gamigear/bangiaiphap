// SMM Panel Types

export type Platform =
    | 'facebook'
    | 'instagram'
    | 'tiktok'
    | 'youtube'
    | 'telegram'
    | 'threads'
    | 'twitter'
    | 'discord'
    | 'shopee'

export type ServiceType =
    | 'like'
    | 'follow'
    | 'comment'
    | 'share'
    | 'view'
    | 'subscriber'
    | 'reaction'

export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'in_progress'
    | 'completed'
    | 'partial'
    | 'cancelled'
    | 'refunded'

export type TransactionType =
    | 'deposit'
    | 'order'
    | 'refund'
    | 'bonus'

export type PaymentMethod =
    | 'bank_transfer'
    | 'momo'
    | 'zalopay'
    | 'card'

export type UserTier =
    | 'ADMIN'
    | 'MEMBER'
    | 'VIP'
    | 'RESELLER'
    | 'AGENCY'

// Service Category
export interface ServiceCategory {
    id: string
    name: string
    slug: Platform
    icon: string
    color: string
    description?: string
    isActive: boolean
    order: number
}

// Service Server (Option for a service)
export interface ServiceServer {
    id: string
    name: string
    price: number // per 1000
    minQuantity: number
    maxQuantity: number
    estimatedTime: string
    speed: string
    quality: string
    isRecommended?: boolean
    isActive: boolean
    description?: string
    tags?: string[]
}

// Service
export interface Service {
    id: string
    categoryId: string
    name: string
    slug: string
    type: ServiceType
    description: string
    servers: ServiceServer[]
    instructions?: string
    faq?: Array<{
        question: string
        answer: string
    }>
    isActive: boolean
    order: number
}

// Order
export interface Order {
    id: string
    orderId: string // Display ID like #ORD-001234
    userId: string
    serviceId: string
    serverId: string
    link: string
    quantity: number
    totalPrice: number
    status: OrderStatus
    startCount?: number
    remainQuantity?: number
    note?: string
    createdAt: Date
    updatedAt: Date
    completedAt?: Date
}

// Transaction
export interface Transaction {
    id: string
    transactionId: string // Display ID
    userId: string
    type: TransactionType
    amount: number
    balanceAfter: number
    description: string
    paymentMethod?: PaymentMethod
    status: 'pending' | 'completed' | 'failed'
    metadata?: Record<string, unknown>
    createdAt: Date
}

// User Wallet
export interface UserWallet {
    userId: string
    balance: number
    totalDeposit: number
    totalSpent: number
    tier: UserTier
}

// Dashboard Stats
export interface DashboardStats {
    balance: number
    totalDeposit: number
    totalSpent: number
    tier: UserTier
    totalOrders: number
    pendingOrders: number
    completedOrders: number
}

// News/Announcement
export interface Announcement {
    id: string
    title: string
    content: string
    author: string
    isPinned: boolean
    createdAt: Date
}

// Ticket/Support
export interface Ticket {
    id: string
    ticketId: string
    userId: string
    subject: string
    message: string
    status: 'open' | 'replied' | 'closed'
    priority: 'low' | 'medium' | 'high'
    replies: TicketReply[]
    createdAt: Date
    updatedAt: Date
}

export interface TicketReply {
    id: string
    ticketId: string
    userId: string
    isAdmin: boolean
    message: string
    createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
