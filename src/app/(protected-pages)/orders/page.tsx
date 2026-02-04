'use client'

import { useState } from 'react'
import { Card, Button, Input, Badge, Select } from '@/components/ui'
import { useOrders } from '@/hooks/api'
import dayjs from 'dayjs'
import classNames from 'classnames'
import {
    PiMagnifyingGlassDuotone,
    PiArrowsClockwiseDuotone,
    PiEyeDuotone,
} from 'react-icons/pi'
import { TbShoppingCart, TbFilter, TbLoader2 } from 'react-icons/tb'

type OrderStatusType = 'PENDING' | 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'CANCELLED' | 'REFUNDED'

const statusConfig: Record<OrderStatusType, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xử lý', color: 'bg-warning text-white' },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-info text-white' },
    IN_PROGRESS: { label: 'Đang chạy', color: 'bg-primary text-white' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-success text-white' },
    PARTIAL: { label: 'Hoàn thành một phần', color: 'bg-warning text-white' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-error text-white' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-gray-500 text-white' },
}

const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'IN_PROGRESS', label: 'Đang chạy' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
]

interface Order {
    id: string
    orderId: string
    link: string
    quantity: number
    totalPrice: number | string
    status: OrderStatusType
    remainQuantity?: number
    createdAt: string
    service: {
        name: string
        category: {
            name: string
        }
    }
    server: {
        name: string
    }
}

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState(statusOptions[0])
    const [showFilters, setShowFilters] = useState(false)
    const [page, setPage] = useState(1)

    // Fetch orders from API
    const { orders, pagination, isLoading, mutate } = useOrders({
        status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
        page,
        limit: 20,
    })

    // Filter by search term (client-side for now)
    const filteredOrders = (orders as Order[]).filter((order: Order) => {
        const matchesSearch =
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.link.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    const handleRefresh = () => {
        mutate()
    }

    return (
        <div className="space-y-4 md:space-y-6 smm-main-content">
            {/* Header */}
            <div className="smm-animate-fadeInUp">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold heading-text flex items-center gap-2">
                            <TbShoppingCart className="text-primary" />
                            Lịch sử đơn hàng
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                            {pagination?.total || 0} đơn hàng
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="default"
                            icon={isLoading ? <TbLoader2 className="animate-spin" /> : <PiArrowsClockwiseDuotone />}
                            className="flex-1 sm:flex-initial"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            Làm mới
                        </Button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden p-2 border rounded-lg dark:border-gray-700"
                        >
                            <TbFilter size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters - Collapsible on mobile */}
            <div className={`smm-animate-fadeInUp ${showFilters ? 'block' : 'hidden md:block'}`}>
                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm theo mã đơn hoặc link..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                prefix={<PiMagnifyingGlassDuotone className="text-gray-400" />}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(option) => {
                                    setStatusFilter(option as typeof statusFilter)
                                    setPage(1)
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <TbLoader2 className="animate-spin text-primary mx-auto" size={32} />
                        <p className="text-gray-500 mt-2">Đang tải đơn hàng...</p>
                    </div>
                </div>
            )}

            {/* Mobile Cards View */}
            {!isLoading && (
                <div className="md:hidden space-y-3">
                    {filteredOrders.map((order: Order) => (
                        <Card key={order.id} className="p-4 smm-animate-fadeInUp">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="font-mono text-primary font-medium text-sm">
                                        {order.orderId}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
                                    </p>
                                </div>
                                <Badge
                                    className={classNames(
                                        'text-xs',
                                        statusConfig[order.status]?.color || 'bg-gray-500'
                                    )}
                                >
                                    {statusConfig[order.status]?.label || order.status}
                                </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Dịch vụ:</span>
                                    <span className="font-medium truncate max-w-[180px]">
                                        {order.service?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Link:</span>
                                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                                        {order.link}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số lượng:</span>
                                    <span className="font-medium">{order.quantity.toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Giá:</span>
                                    <span className="font-bold text-primary">
                                        {Number(order.totalPrice).toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                <Button size="xs" variant="plain" icon={<PiEyeDuotone />} className="w-full">
                                    Xem chi tiết
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Desktop Table View */}
            {!isLoading && (
                <Card className="overflow-hidden hidden md:block smm-animate-fadeInUp">
                    <div className="smm-table-scroll">
                        <table className="smm-table w-full">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4">Mã đơn</th>
                                    <th className="py-3 px-4">Dịch vụ</th>
                                    <th className="py-3 px-4">Link/UID</th>
                                    <th className="py-3 px-4 text-right">Số lượng</th>
                                    <th className="py-3 px-4 text-right">Giá</th>
                                    <th className="py-3 px-4 text-center">Trạng thái</th>
                                    <th className="py-3 px-4 text-right">Thời gian</th>
                                    <th className="py-3 px-4 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order: Order) => (
                                    <tr key={order.id}>
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-primary font-medium">
                                                {order.orderId}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-medium heading-text">
                                                {order.service?.name || 'N/A'}
                                            </span>
                                            {order.service?.category && (
                                                <span className="text-xs text-gray-400 block">
                                                    {order.service.category.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 max-w-[200px]">
                                            <span className="text-gray-500 truncate block" title={order.link}>
                                                {order.link.length > 30
                                                    ? order.link.substring(0, 30) + '...'
                                                    : order.link}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="font-medium">
                                                {order.quantity.toLocaleString('vi-VN')}
                                            </span>
                                            {order.remainQuantity && (
                                                <span className="text-gray-400 text-xs block">
                                                    Còn: {order.remainQuantity.toLocaleString('vi-VN')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right font-medium text-primary">
                                            {Number(order.totalPrice).toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <Badge
                                                className={classNames(
                                                    'text-xs',
                                                    statusConfig[order.status]?.color || 'bg-gray-500'
                                                )}
                                            >
                                                {statusConfig[order.status]?.label || order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4 text-right text-gray-400 text-xs">
                                            {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <Button
                                                size="xs"
                                                variant="plain"
                                                icon={<PiEyeDuotone />}
                                            >
                                                Chi tiết
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
                            <span className="text-sm text-gray-500">
                                Trang {pagination.page} / {pagination.totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="xs"
                                    variant="plain"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Trước
                                </Button>
                                <Button
                                    size="xs"
                                    variant="plain"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {!isLoading && filteredOrders.length === 0 && (
                <div className="py-12 text-center text-gray-500 smm-animate-fadeInUp">
                    <TbShoppingCart className="mx-auto text-4xl mb-2 text-gray-300" />
                    <p>Không tìm thấy đơn hàng nào</p>
                </div>
            )}
        </div>
    )
}
