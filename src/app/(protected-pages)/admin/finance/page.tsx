'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiSearch, HiCheck, HiX, HiCurrencyDollar, HiPlus, HiMinus } from 'react-icons/hi'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
]

const typeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'DEPOSIT', label: 'Nạp tiền' },
    { value: 'ORDER', label: 'Đơn hàng' },
    { value: 'REFUND', label: 'Hoàn tiền' },
    { value: 'MANUAL', label: 'Thủ công' },
]

export default function AdminFinancePage() {
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [adjustAmount, setAdjustAmount] = useState('')
    const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add')
    const [adjustNote, setAdjustNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: transactionsData, mutate } = useSWR(
        `/api/admin/finance?status=${statusFilter}&type=${typeFilter}&search=${search}`,
        fetcher
    )

    const { data: statsData } = useSWR('/api/admin/finance/stats', fetcher)

    const transactions = transactionsData?.data || []
    const stats = statsData?.data || {
        totalDeposit: 0,
        totalSpent: 0,
        pendingDeposits: 0,
        todayRevenue: 0
    }

    const handleApproveDeposit = async (transactionId: string) => {
        try {
            const res = await fetch(`/api/admin/finance/${transactionId}/approve`, {
                method: 'POST'
            })
            const data = await res.json()
            if (data.success) {
                toast.push(<Notification type="success" title="Đã duyệt giao dịch" />)
                mutate()
            } else {
                toast.push(<Notification type="danger" title={data.error} />)
            }
        } catch {
            toast.push(<Notification type="danger" title="Có lỗi xảy ra" />)
        }
    }

    const handleRejectDeposit = async (transactionId: string) => {
        try {
            const res = await fetch(`/api/admin/finance/${transactionId}/reject`, {
                method: 'POST'
            })
            const data = await res.json()
            if (data.success) {
                toast.push(<Notification type="success" title="Đã từ chối giao dịch" />)
                mutate()
            } else {
                toast.push(<Notification type="danger" title={data.error} />)
            }
        } catch {
            toast.push(<Notification type="danger" title="Có lỗi xảy ra" />)
        }
    }

    const handleAdjustBalance = async () => {
        if (!selectedUser || !adjustAmount) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/admin/finance/adjust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    amount: parseFloat(adjustAmount),
                    type: adjustType,
                    note: adjustNote
                })
            })
            const data = await res.json()
            if (data.success) {
                toast.push(<Notification type="success" title="Đã điều chỉnh số dư" />)
                setIsAdjustModalOpen(false)
                setSelectedUser(null)
                setAdjustAmount('')
                setAdjustNote('')
                mutate()
            } else {
                toast.push(<Notification type="danger" title={data.error} />)
            }
        } catch {
            toast.push(<Notification type="danger" title="Có lỗi xảy ra" />)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-amber-100 text-amber-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        }
        const labels: Record<string, string> = {
            PENDING: 'Chờ duyệt',
            COMPLETED: 'Hoàn thành',
            CANCELLED: 'Đã hủy',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        )
    }

    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            DEPOSIT: 'bg-blue-100 text-blue-800',
            ORDER: 'bg-purple-100 text-purple-800',
            REFUND: 'bg-orange-100 text-orange-800',
            MANUAL: 'bg-gray-100 text-gray-800',
        }
        const labels: Record<string, string> = {
            DEPOSIT: 'Nạp tiền',
            ORDER: 'Đơn hàng',
            REFUND: 'Hoàn tiền',
            MANUAL: 'Thủ công',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100'}`}>
                {labels[type] || type}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý Tài chính</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiCurrencyDollar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Tổng nạp</p>
                            <p className="text-xl font-bold">{formatCurrency(stats.totalDeposit)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiCurrencyDollar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Tổng chi tiêu</p>
                            <p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiCurrencyDollar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Chờ duyệt</p>
                            <p className="text-xl font-bold">{formatCurrency(stats.pendingDeposits)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiCurrencyDollar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Doanh thu hôm nay</p>
                            <p className="text-xl font-bold">{formatCurrency(stats.todayRevenue)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Tìm theo mã giao dịch, email..."
                            prefix={<HiSearch />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-40">
                        <Select
                            options={statusOptions}
                            value={statusOptions.find(o => o.value === statusFilter)}
                            onChange={(option: any) => setStatusFilter(option.value)}
                        />
                    </div>
                    <div className="w-40">
                        <Select
                            options={typeOptions}
                            value={typeOptions.find(o => o.value === typeFilter)}
                            onChange={(option: any) => setTypeFilter(option.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Transactions Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Mã GD</th>
                                <th className="text-left py-3 px-4">Người dùng</th>
                                <th className="text-left py-3 px-4">Loại</th>
                                <th className="text-right py-3 px-4">Số tiền</th>
                                <th className="text-left py-3 px-4">Trạng thái</th>
                                <th className="text-left py-3 px-4">Mô tả</th>
                                <th className="text-left py-3 px-4">Thời gian</th>
                                <th className="text-center py-3 px-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="py-3 px-4 font-mono text-sm">{tx.transactionId}</td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">{tx.user?.name || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{tx.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">{getTypeBadge(tx.type)}</td>
                                    <td className="py-3 px-4 text-right font-medium">
                                        <span className={tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-600' : 'text-red-600'}>
                                            {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}
                                            {formatCurrency(Number(tx.amount))}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                                    <td className="py-3 px-4 text-sm max-w-[200px] truncate">{tx.description}</td>
                                    <td className="py-3 px-4 text-sm">
                                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4">
                                        {tx.status === 'PENDING' && tx.type === 'DEPOSIT' && (
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    size="xs"
                                                    variant="solid"
                                                    className="bg-green-500 hover:bg-green-600"
                                                    icon={<HiCheck />}
                                                    onClick={() => handleApproveDeposit(tx.id)}
                                                />
                                                <Button
                                                    size="xs"
                                                    variant="solid"
                                                    className="bg-red-500 hover:bg-red-600"
                                                    icon={<HiX />}
                                                    onClick={() => handleRejectDeposit(tx.id)}
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        Không có giao dịch nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Adjust Balance Modal */}
            <Dialog isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)}>
                <h3 className="text-lg font-bold mb-4">Điều chỉnh số dư</h3>
                {selectedUser && (
                    <div className="space-y-4">
                        <p>Người dùng: <strong>{selectedUser.email}</strong></p>
                        <div className="flex gap-2">
                            <Button
                                variant={adjustType === 'add' ? 'solid' : 'plain'}
                                className={adjustType === 'add' ? 'bg-green-500' : ''}
                                icon={<HiPlus />}
                                onClick={() => setAdjustType('add')}
                            >
                                Cộng tiền
                            </Button>
                            <Button
                                variant={adjustType === 'subtract' ? 'solid' : 'plain'}
                                className={adjustType === 'subtract' ? 'bg-red-500' : ''}
                                icon={<HiMinus />}
                                onClick={() => setAdjustType('subtract')}
                            >
                                Trừ tiền
                            </Button>
                        </div>
                        <Input
                            type="number"
                            placeholder="Số tiền"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                        />
                        <Input
                            placeholder="Ghi chú"
                            value={adjustNote}
                            onChange={(e) => setAdjustNote(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setIsAdjustModalOpen(false)}>Hủy</Button>
                            <Button
                                variant="solid"
                                loading={isSubmitting}
                                onClick={handleAdjustBalance}
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}
