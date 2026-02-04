'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Select, Badge, Skeleton, Pagination, toast, Dialog, FormItem, FormContainer, Notification } from '@/components/ui'
import {
    TbSearch,
    TbFilter,
    TbDownload,
    TbExternalLink,
    TbDotsVertical,
    TbEdit,
    TbRefresh,
    TbTrash,
    TbEye
} from 'react-icons/tb'
import useSWR from 'swr'
import dayjs from 'dayjs'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const orderStatuses = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'IN_PROGRESS', label: 'Đang chạy' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'PARTIAL', label: 'Hoàn thành một phần' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
]

const AdminOrders = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [editStatus, setEditStatus] = useState('')
    const [refundAmount, setRefundAmount] = useState('')
    const [startCount, setStartCount] = useState('')
    const [remainQuantity, setRemainQuantity] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const limit = 10

    const { data: response, isLoading, mutate } = useSWR(
        `/api/admin/orders?q=${searchTerm}&status=${statusFilter}&page=${page}&limit=${limit}`,
        fetcher
    )
    const orders = response?.data || []
    const pagination = response?.pagination

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPage(1)
    }

    const openEditModal = (order: any) => {
        setSelectedOrder(order)
        setEditStatus(order.status)
        setRefundAmount('')
        setStartCount(order.startCount?.toString() || '')
        setRemainQuantity(order.remainQuantity?.toString() || '')
        setIsEditModalOpen(true)
    }

    const handleUpdateOrder = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: editStatus,
                    refundAmount: refundAmount ? Number(refundAmount) : 0,
                    startCount,
                    remainQuantity
                })
            })

            const result = await res.json()
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        {result.message}
                    </Notification>
                )
                setIsEditModalOpen(false)
                mutate()
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        {result.error}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    Đã có lỗi xảy ra
                </Notification>
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteOrder = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return

        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'DELETE'
            })
            const result = await res.json()
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        {result.message}
                    </Notification>
                )
                mutate()
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    Đã có lỗi xảy ra
                </Notification>
            )
        }
    }

    return (
        <div className="space-y-6 smm-main-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold heading-text">Đơn Hàng Toàn Hệ Thống</h1>
                    <p className="text-gray-500">Theo dõi, cập nhật trạng thái và xử lý khiếu nại đơn hàng.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" icon={<TbRefresh size={18} />} onClick={() => mutate()}>
                        Làm mới
                    </Button>
                    <Button variant="solid" icon={<TbDownload size={18} />}>
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 border-none shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Tìm mã đơn, link, email khách..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Select
                            value={statusFilter}
                            onChange={(e: any) => {
                                setStatusFilter(e.target.value)
                                setPage(1)
                            }}
                            className="min-w-[150px]"
                        >
                            {orderStatuses.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </Select>
                        <Button variant="plain" icon={<TbFilter size={18} />}>
                            Bộ lọc
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="p-0 border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Mã Đơn / Ngày</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Dịch Vụ / Link</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Khách Hàng</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px] text-center">Số Lượng</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px] text-right">Tổng Tiền</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px] text-center">Trạng Thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px] text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {isLoading ? (
                                Array(limit).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-12 mx-auto rounded-lg" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                                    </tr>
                                ))
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group text-xs">
                                        <td className="px-6 py-4">
                                            <p className="font-mono font-bold text-primary uppercase tracking-tight mb-1">{order.orderId}</p>
                                            <p className="text-gray-400">{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                                        </td>
                                        <td className="px-6 py-4 max-w-[250px]">
                                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{order.service?.name}</p>
                                            <p className="text-gray-400 truncate mt-1 flex items-center gap-1">
                                                <TbExternalLink size={12} className="shrink-0" />
                                                <a href={order.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline-offset-2 hover:underline">
                                                    {order.link}
                                                </a>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{order.user?.name || order.user?.email.split('@')[0]}</p>
                                            <p className="text-gray-400 truncate max-w-[120px]">{order.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="font-black text-gray-700 dark:text-gray-300">{order.quantity.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-primary">
                                            {(order.totalPrice || 0).toLocaleString()}đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                                order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="default" icon={<TbEdit size={16} />} title="Sửa đơn" onClick={() => openEditModal(order)} />
                                                <Button size="sm" variant="default" icon={<TbTrash size={16} />} className="text-red-500" title="Xóa đơn" onClick={() => handleDeleteOrder(order.id)} />
                                            </div>
                                            <TbDotsVertical className="text-gray-300 ml-auto group-hover:hidden" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-bold font-mono uppercase tracking-widest italic">
                        Tổng cộng: {pagination?.total || 0} đơn hàng
                    </p>
                    {pagination && pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            total={pagination.total}
                            pageSize={limit}
                            onChange={(p) => setPage(p)}
                        />
                    )}
                </div>
            </Card>

            {/* Edit Order Modal */}
            <Dialog
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onRequestClose={() => setIsEditModalOpen(false)}
            >
                <div>
                    <h5 className="mb-4">Chỉnh sửa đơn hàng {selectedOrder?.orderId}</h5>
                    <FormContainer>
                        <FormItem label="Trạng thái">
                            <Select value={editStatus} onChange={(e: any) => setEditStatus(e.target.value)}>
                                {orderStatuses.filter(s => s.value !== 'all').map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </Select>
                        </FormItem>
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem label="Bắt đầu">
                                <Input
                                    type="number"
                                    value={startCount}
                                    onChange={(e) => setStartCount(e.target.value)}
                                />
                            </FormItem>
                            <FormItem label="Còn lại">
                                <Input
                                    type="number"
                                    value={remainQuantity}
                                    onChange={(e) => setRemainQuantity(e.target.value)}
                                />
                            </FormItem>
                        </div>
                        <FormItem label="Số tiền hoàn (nếu có)">
                            <Input
                                type="number"
                                placeholder="Nhập số tiền hoàn..."
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                            />
                        </FormItem>
                        <div className="text-right mt-6">
                            <Button
                                className="mr-2"
                                variant="plain"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="solid"
                                loading={isSubmitting}
                                onClick={handleUpdateOrder}
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    </FormContainer>
                </div>
            </Dialog>
        </div>
    )
}

export default AdminOrders

