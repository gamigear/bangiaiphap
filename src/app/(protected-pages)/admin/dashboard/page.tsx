'use client'

import React from 'react'
import { Card, Button, Skeleton } from '@/components/ui'
import {
    TbUsers,
    TbShoppingCart,
    TbCurrencyDong,
    TbArrowUpRight,
    TbChartBar,
    TbArrowNarrowRight,
    TbClock,
    TbActivity
} from 'react-icons/tb'
import useSWR from 'swr'
import Link from 'next/link'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const fetcher = (url: string) => fetch(url).then(res => res.json())

const AdminDashboard = () => {
    const { data: response, isLoading } = useSWR('/api/admin/stats', fetcher)
    const dashboardData = response?.data

    const stats = [
        {
            title: 'Tổng người dùng',
            value: dashboardData?.stats?.totalUsers || 0,
            icon: <TbUsers size={24} />,
            color: 'bg-blue-500',
            textColor: 'text-blue-500',
            bgLight: 'bg-blue-50',
            link: '/admin/users'
        },
        {
            title: 'Tổng đơn hàng',
            value: dashboardData?.stats?.totalOrders || 0,
            icon: <TbShoppingCart size={24} />,
            color: 'bg-purple-500',
            textColor: 'text-purple-500',
            bgLight: 'bg-purple-50',
            link: '/admin/orders'
        },
        {
            title: 'Doanh thu (Tổng chi)',
            value: `${(dashboardData?.stats?.totalRevenue || 0).toLocaleString()}đ`,
            icon: <TbCurrencyDong size={24} />,
            color: 'bg-green-500',
            textColor: 'text-green-500',
            bgLight: 'bg-green-50',
            link: '/admin/orders'
        },
        {
            title: 'Tổng nạp hệ thống',
            value: `${(dashboardData?.stats?.totalDeposit || 0).toLocaleString()}đ`,
            icon: <TbChartBar size={24} />,
            color: 'bg-orange-500',
            textColor: 'text-orange-500',
            bgLight: 'bg-orange-50',
            link: '/admin/history'
        }
    ]

    return (
        <div className="space-y-6 smm-main-content pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 smm-animate-fadeInUp">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold heading-text tracking-tight">
                        Quản Trị Hệ Thống
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <TbActivity className="text-green-500 animate-pulse" />
                        Trạng thái hệ thống: <span className="text-green-500 font-bold uppercase text-xs">Phản hồi tốt</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" className="flex items-center gap-2">
                        <TbClock /> Tải lại
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 smm-stagger">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-0 overflow-hidden border-none shadow-sm hover:shadow-md transition-all smm-animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-2xl ${stat.bgLight} ${stat.textColor}`}>
                                    {stat.icon}
                                </div>
                                <Link href={stat.link} className="text-gray-400 hover:text-primary transition-colors">
                                    <TbArrowUpRight size={20} />
                                </Link>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-2xl md:text-3xl font-black mt-1">
                                    {isLoading ? <Skeleton className="h-9 w-24" /> : stat.value}
                                </h3>
                            </div>
                        </div>
                        <div className={`h-1.5 w-full ${stat.color} opacity-20`}></div>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 space-y-4 smm-animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                            <TbShoppingCart className="text-primary" />
                            Đơn hàng mới nhất
                        </h4>
                        <Link href="/admin/orders">
                            <Button variant="plain" size="sm" className="text-primary hover:bg-primary/5 flex items-center gap-1 font-bold">
                                Tất cả <TbArrowNarrowRight />
                            </Button>
                        </Link>
                    </div>

                    <Card className="p-0 border-none shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Dịch vụ</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Khách hàng</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Giá trị</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {isLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                                <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        dashboardData?.recentOrders?.map((order: any) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{order.service?.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase">{order.orderId}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{order.user?.name || order.user?.email.split('@')[0]}</p>
                                                    <p className="text-[10px] text-gray-400">{dayjs(order.createdAt).fromNow()}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-sm font-black text-primary">{(order.totalPrice || 0).toLocaleString()}đ</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {!isLoading && dashboardData?.recentOrders?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                                                Chưa có dữ liệu đơn hàng
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Recent Users */}
                <div className="lg:col-span-1 space-y-4 smm-animate-slideInRight" style={{ animationDelay: '0.6s' }}>
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                            <TbUsers className="text-primary" />
                            Thành viên mới
                        </h4>
                        <Link href="/admin/users">
                            <Button variant="plain" size="sm" className="text-primary hover:bg-primary/5 font-bold">
                                Tất cả
                            </Button>
                        </Link>
                    </div>

                    <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <div className="space-y-4">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                dashboardData?.recentUsers?.map((user: any) => (
                                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                                            {user.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{user.name || user.email.split('@')[0]}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-bold text-gray-500">{user.tier}</span>
                                                <span className="text-[10px] text-gray-400">{dayjs(user.createdAt).format('DD/MM')}</span>
                                            </div>
                                        </div>
                                        <Link href={`/admin/users?id=${user.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-primary/10 rounded-lg text-primary">
                                                <TbArrowNarrowRight />
                                            </button>
                                        </Link>
                                    </div>
                                ))
                            )}
                            {!isLoading && dashboardData?.recentUsers?.length === 0 && (
                                <p className="text-center py-6 text-gray-400 text-sm italic">Hệ thống chưa có người dùng</p>
                            )}
                        </div>
                    </Card>

                    {/* System Info Banner */}
                    <Card className="p-4 bg-primary text-white border-none shadow-lg smm-card-gradient overflow-hidden relative">
                        <div className="relative z-10">
                            <p className="text-xs opacity-80 uppercase font-black tracking-widest">Hệ thống ví</p>
                            <h2 className="text-2xl font-black mt-1">{(dashboardData?.stats?.systemBalance || 0).toLocaleString()}đ</h2>
                            <p className="text-[10px] mt-2 opacity-70 italic">* Đây là tổng số dư khả dụng của tất cả người dùng.</p>
                        </div>
                        <TbCurrencyDong size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
