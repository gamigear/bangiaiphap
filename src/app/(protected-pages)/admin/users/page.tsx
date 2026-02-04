'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Select, Badge, Skeleton, Pagination, toast, Dialog, FormItem, FormContainer, Notification } from '@/components/ui'
import {
    TbSearch,
    TbFilter,
    TbDownload,
    TbUserPlus,
    TbDotsVertical,
    TbEdit,
    TbTrash,
    TbWallet,
    TbHistory
} from 'react-icons/tb'
import useSWR from 'swr'
import dayjs from 'dayjs'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)

    // Balance Modal State
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
    const [balanceAmount, setBalanceAmount] = useState('')
    const [balanceAction, setBalanceAction] = useState('DEPOSIT')
    const [balanceDesc, setBalanceDesc] = useState('')

    // User Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [userForm, setUserForm] = useState({ name: '', email: '', tier: 'MEMBER', isActive: true })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const limit = 10

    const { data: response, isLoading, mutate } = useSWR(
        `/api/admin/users?q=${searchTerm}&page=${page}&limit=${limit}`,
        fetcher
    )
    const users = response?.data || []
    const pagination = response?.pagination

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPage(1)
    }

    const openBalanceModal = (user: any) => {
        setSelectedUser(user)
        setIsBalanceModalOpen(true)
        setBalanceAmount('')
        setBalanceDesc('')
    }

    const openEditModal = (user: any) => {
        setSelectedUser(user)
        setUserForm({
            name: user.name || '',
            email: user.email,
            tier: user.tier,
            isActive: user.isActive !== false
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateBalance = async () => {
        if (!balanceAmount || isNaN(Number(balanceAmount))) {
            toast.push(<Notification title="Lỗi" type="danger">Số tiền không hợp lệ</Notification>)
            return
        }

        setIsSubmitting(true)
        try {
            const amount = balanceAction === 'DEPOSIT' ? Number(balanceAmount) : -Number(balanceAmount)
            const res = await fetch(`/api/admin/users/${selectedUser.id}/wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    type: balanceAction === 'DEPOSIT' ? 'DEPOSIT' : 'WITHDRAWAL',
                    description: balanceDesc || (balanceAction === 'DEPOSIT' ? 'Admin cộng tiền' : 'Admin trừ tiền')
                })
            })

            const result = await res.json()
            if (result.success) {
                toast.push(<Notification title="Thành công" type="success">{result.message}</Notification>)
                setIsBalanceModalOpen(false)
                mutate()
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateUser = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm)
            })

            const result = await res.json()
            if (result.success) {
                toast.push(<Notification title="Thành công" type="success">{result.message}</Notification>)
                setIsEditModalOpen(false)
                mutate()
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
        if ((await res.json()).success) {
            toast.push(<Notification title="Đã xóa" type="success" />)
            mutate()
        }
    }


    return (
        <div className="space-y-6 smm-main-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold heading-text">Quản Lý Người Dùng</h1>
                    <p className="text-gray-500">Xem, chỉnh sửa và quản lý tất cả thành viên trong hệ thống.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" className="flex items-center gap-2">
                        <TbDownload size={18} /> Xuất dữ liệu
                    </Button>
                    <Button variant="solid" className="flex items-center gap-2">
                        <TbUserPlus size={18} /> Thêm người dùng
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 border-none shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm theo email, tên..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Select placeholder="Cấp độ" className="min-w-[120px]">
                            <option value="all">Tất cả</option>
                            <option value="MEMBER">Member</option>
                            <option value="VIP">VIP</option>
                            <option value="AGENCY">Agency</option>
                        </Select>
                        <Button variant="plain" className="flex items-center gap-2">
                            <TbFilter size={18} /> Lọc nâng cao
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Người dùng</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cấp độ</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Số dư</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Đơn hàng</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày tham gia</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {isLoading ? (
                                Array(limit).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                                    </tr>
                                ))
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {(user.name || user.email)[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                                        {user.name || (user.email.split('@')[0])}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${user.tier === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                                user.tier === 'GURU' ? 'bg-purple-100 text-purple-600' :
                                                    user.tier === 'VIP' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {user.tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-200">
                                                {(user.balance || 0).toLocaleString()}đ
                                            </p>
                                            <p className="text-[10px] text-gray-400">T.nạp: {(user.totalDeposit || 0).toLocaleString()}đ</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{user.orderCount || 0} đơn</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {dayjs(user.createdAt).format('DD/MM/YYYY')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="default" icon={<TbWallet size={16} />} title="Cộng/Trừ tiền" onClick={() => openBalanceModal(user)} />
                                                <Button size="sm" variant="default" icon={<TbEdit size={16} />} title="Sửa thông tin" onClick={() => openEditModal(user)} />
                                                <Button size="sm" variant="default" icon={<TbTrash size={16} />} className="text-red-500" title="Xóa người dùng" onClick={() => handleDeleteUser(user.id)} />
                                            </div>
                                            <div className="group-hover:hidden text-right">
                                                <TbDotsVertical className="text-gray-300 ml-auto inline-block" />
                                            </div>
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
                        Tổng cộng: {pagination?.total || 0} khách hàng
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

            {/* Balance Update Modal */}
            <Dialog
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                onRequestClose={() => setIsBalanceModalOpen(false)}
            >
                <div className="p-2">
                    <h5 className="mb-4">Cập nhật số dư: {selectedUser?.email}</h5>
                    <FormContainer>
                        <FormItem label="Hành động">
                            <Select value={balanceAction} onChange={(e: any) => setBalanceAction(e.target.value)}>
                                <option value="DEPOSIT">Cộng tiền (+)</option>
                                <option value="WITHDRAWAL">Trừ tiền (-)</option>
                            </Select>
                        </FormItem>
                        <FormItem label="Số tiền">
                            <Input
                                type="number"
                                placeholder="Nhập số tiền..."
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                            />
                        </FormItem>
                        <FormItem label="Ghi chú">
                            <Input
                                placeholder="Lý do thay đổi..."
                                value={balanceDesc}
                                onChange={(e) => setBalanceDesc(e.target.value)}
                            />
                        </FormItem>
                        <div className="text-right mt-6">
                            <Button className="mr-2" variant="plain" onClick={() => setIsBalanceModalOpen(false)}>Hủy</Button>
                            <Button variant="solid" loading={isSubmitting} onClick={handleUpdateBalance}>Lưu</Button>
                        </div>
                    </FormContainer>
                </div>
            </Dialog>

            {/* User Edit Modal */}
            <Dialog
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onRequestClose={() => setIsEditModalOpen(false)}
            >
                <div className="p-2">
                    <h5 className="mb-4">Sửa thông tin: {selectedUser?.email}</h5>
                    <FormContainer>
                        <FormItem label="Họ tên">
                            <Input
                                value={userForm.name}
                                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                            />
                        </FormItem>
                        <FormItem label="Cấp độ (Tier)">
                            <Select value={userForm.tier} onChange={(e: any) => setUserForm({ ...userForm, tier: e.target.value })}>
                                <option value="MEMBER">MEMBER</option>
                                <option value="COLLABORATOR">COLLABORATOR</option>
                                <option value="AGENCY">AGENCY</option>
                                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                            </Select>
                        </FormItem>
                        <FormItem label="Trạng thái">
                            <Select value={userForm.isActive ? 'true' : 'false'} onChange={(e: any) => setUserForm({ ...userForm, isActive: e.target.value === 'true' })}>
                                <option value="true">Hoạt động</option>
                                <option value="false">Khóa tài khoản</option>
                            </Select>
                        </FormItem>
                        <div className="text-right mt-6">
                            <Button className="mr-2" variant="plain" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                            <Button variant="solid" loading={isSubmitting} onClick={handleUpdateUser}>Lưu thay đổi</Button>
                        </div>
                    </FormContainer>
                </div>
            </Dialog>
        </div>
    )
}

export default AdminUsers


