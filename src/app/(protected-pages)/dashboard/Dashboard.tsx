'use client'

import { BalanceCard, TotalDepositCard, TierCard, TelegramAlert, AnnouncementList, RecentUpdates } from '@/components/smm'
import { useWallet, useOrders } from '@/hooks/api'
import { TbBell, TbChartBar, TbArrowUpRight, TbPlus, TbWallet, TbLoader2 } from 'react-icons/tb'
import Link from 'next/link'
import useSWR from 'swr'

// Fetcher for announcements
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Dashboard() {
    // Fetch wallet data from API
    const { wallet, isLoading: walletLoading } = useWallet()

    // Fetch orders for stats
    const { orders, isLoading: ordersLoading } = useOrders({ limit: 100 })

    // Fetch announcements from API
    const { data: announcementsData } = useSWR('/api/announcements', fetcher, {
        fallbackData: { success: true, data: [] },
        revalidateOnFocus: false,
    })

    // Calculate order stats
    const orderStats = {
        totalOrders: orders?.length || 0,
        completedOrders: orders?.filter((o: { status: string }) => o.status === 'COMPLETED').length || 0,
        pendingOrders: orders?.filter((o: { status: string }) => ['PENDING', 'PROCESSING', 'IN_PROGRESS'].includes(o.status)).length || 0,
    }

    // Dashboard stats from wallet
    const dashboardStats = {
        balance: wallet?.balance || 0,
        totalDeposit: wallet?.totalDeposit || 0,
        tier: (wallet?.tier as 'ADMIN' | 'MEMBER' | 'VIP' | 'RESELLER' | 'AGENCY') || 'MEMBER',
        totalOrders: orderStats.totalOrders,
        completedOrders: orderStats.completedOrders,
        pendingOrders: orderStats.pendingOrders,
    }

    const announcements = announcementsData?.data || []

    // Recent updates - could come from API too
    const recentUpdates = [
        { id: '1', type: 'service' as const, title: 'Hệ thống nâng cấp', content: 'Hệ thống đã được nâng cấp', timeAgo: '5 phút trước' },
        { id: '2', type: 'service' as const, title: 'TikTok mới', content: 'Thêm dịch vụ TikTok mới', timeAgo: '1 giờ trước' },
        { id: '3', type: 'promotion' as const, title: 'Ưu đãi nạp tiền', content: 'Ưu đãi nạp tiền 10%', timeAgo: '2 giờ trước' },
    ]

    const isLoading = walletLoading || ordersLoading

    return (
        <div className="space-y-4 md:space-y-6 smm-main-content">
            {/* Welcome Header */}
            <div className="smm-animate-fadeInUp">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            Chào mừng trở lại! 👋
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                            Quản lý đơn hàng và theo dõi dịch vụ của bạn
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/wallet/deposit" className="smm-btn-primary flex items-center gap-2 text-sm">
                            <TbWallet />
                            <span className="hidden sm:inline">Nạp tiền</span>
                        </Link>
                        <button className="hidden md:flex smm-btn-primary items-center gap-2">
                            <TbChartBar />
                            Xem thống kê
                        </button>
                    </div>
                </div>
            </div>

            {/* Telegram Verification Alert */}
            <div className="smm-animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <TelegramAlert />
            </div>

            {/* Stats Cards - Horizontal scroll on mobile */}
            <div className="smm-stats-scroll md:grid md:grid-cols-3 gap-4 smm-stagger">
                <div className="smm-stat-card group">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24">
                            <TbLoader2 className="animate-spin text-primary" size={24} />
                        </div>
                    ) : (
                        <TotalDepositCard totalDeposit={dashboardStats.totalDeposit} />
                    )}
                </div>
                <div className="smm-stat-card group">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24">
                            <TbLoader2 className="animate-spin text-primary" size={24} />
                        </div>
                    ) : (
                        <BalanceCard balance={dashboardStats.balance} />
                    )}
                </div>
                <div className="smm-stat-card group">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24">
                            <TbLoader2 className="animate-spin text-primary" size={24} />
                        </div>
                    ) : (
                        <TierCard tier={dashboardStats.tier} />
                    )}
                </div>
            </div>

            {/* Quick Stats Banner - Responsive */}
            <div className="smm-animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-around md:justify-start">
                            <div className="text-center">
                                <div className="text-xl md:text-3xl font-bold">
                                    {isLoading ? '...' : dashboardStats.totalOrders}
                                </div>
                                <div className="text-xs md:text-sm opacity-80">Tổng đơn</div>
                            </div>
                            <div className="w-px h-8 md:h-12 bg-white/20"></div>
                            <div className="text-center">
                                <div className="text-xl md:text-3xl font-bold">
                                    {isLoading ? '...' : dashboardStats.completedOrders}
                                </div>
                                <div className="text-xs md:text-sm opacity-80">Hoàn thành</div>
                            </div>
                            <div className="w-px h-8 md:h-12 bg-white/20"></div>
                            <div className="text-center">
                                <div className="text-xl md:text-3xl font-bold">
                                    {isLoading ? '...' : dashboardStats.pendingOrders}
                                </div>
                                <div className="text-xs md:text-sm opacity-80">Đang chạy</div>
                            </div>
                        </div>
                        <Link
                            href="/orders"
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all text-sm"
                        >
                            Xem chi tiết <TbArrowUpRight />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Mobile Only */}
            <div className="grid grid-cols-4 gap-3 md:hidden smm-animate-fadeInUp" style={{ animationDelay: '0.45s' }}>
                <Link href="/services" className="flex flex-col items-center gap-1 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <TbPlus size={20} />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Đặt hàng</span>
                </Link>
                <Link href="/wallet/deposit" className="flex flex-col items-center gap-1 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <TbWallet size={20} />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Nạp tiền</span>
                </Link>
                <Link href="/orders" className="flex flex-col items-center gap-1 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <TbChartBar size={20} />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Đơn hàng</span>
                </Link>
                <Link href="/support" className="flex flex-col items-center gap-1 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <TbBell size={20} />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Hỗ trợ</span>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Announcements - Left Column (2/3 width on desktop) */}
                <div className="lg:col-span-2 smm-animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                    <div className="smm-card p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                                <TbBell className="text-primary" />
                                Thông báo mới
                            </h2>
                            <span className="smm-badge smm-badge-info">
                                {announcements.length} tin
                            </span>
                        </div>
                        <AnnouncementList announcements={announcements} />
                    </div>
                </div>

                {/* Recent Updates - Right Column (1/3 width on desktop) */}
                <div className="lg:col-span-1 smm-animate-slideInRight" style={{ animationDelay: '0.6s' }}>
                    <div className="smm-card smm-card-gradient p-4 md:p-6">
                        <RecentUpdates updates={recentUpdates} />
                    </div>
                </div>
            </div>
        </div>
    )
}
