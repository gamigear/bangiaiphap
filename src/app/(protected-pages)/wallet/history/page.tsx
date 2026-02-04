'use client'

import { useState, useMemo } from 'react'
import { Card, Button, Input, Select, Skeleton } from '@/components/ui'
import { useTransactions, useWallet } from '@/hooks/api'
import { TbHistory, TbSearch, TbDownload, TbArrowUp, TbArrowDown, TbFilter, TbLoader2 } from 'react-icons/tb'
import dayjs from 'dayjs'

const transactionTypes = [
    { value: 'all', label: 'Tất cả' },
    { value: 'DEPOSIT', label: 'Nạp tiền' },
    { value: 'ORDER', label: 'Đặt đơn' },
    { value: 'REFUND', label: 'Hoàn tiền' },
]

const WalletHistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [page, setPage] = useState(1)

    const { wallet } = useWallet()
    const { transactions, pagination, isLoading } = useTransactions({
        type: filterType === 'all' ? undefined : filterType,
        page,
        limit: 10
    })

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return transactions
        return transactions.filter((tx: any) =>
            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [transactions, searchTerm])

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return <TbArrowDown className="text-green-500" />
            case 'ORDER': return <TbArrowUp className="text-red-500" />
            case 'REFUND': return <TbArrowDown className="text-blue-500" />
            case 'BONUS': return <TbArrowDown className="text-yellow-500" />
            default: return null
        }
    }

    const getTypeBadge = (type: string) => {
        const config: Record<string, { label: string; className: string }> = {
            DEPOSIT: { label: 'Nạp tiền', className: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            ORDER: { label: 'Đặt đơn', className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
            REFUND: { label: 'Hoàn tiền', className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            BONUS: { label: 'Thưởng', className: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
        }
        const { label, className } = config[type] || { label: type, className: '' }
        return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>{label}</span>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 smm-animate-fadeInUp">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TbHistory className="text-primary" />
                        Lịch Sử Giao Dịch
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý toàn bộ biến động số dư trong tài khoản của bạn.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 smm-animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <Card className="p-4 border-b-4 border-b-green-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Tổng nạp</p>
                    <p className="text-xl font-black text-green-500">
                        {Number(wallet?.totalDeposit || 0).toLocaleString()}đ
                    </p>
                </Card>
                <Card className="p-4 border-b-4 border-b-red-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Đã chi</p>
                    <p className="text-xl font-black text-red-500">
                        {Number(wallet?.totalSpent || 0).toLocaleString()}đ
                    </p>
                </Card>
                <Card className="p-4 border-b-4 border-b-blue-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Số dư hiện tại</p>
                    <p className="text-xl font-black text-primary">
                        {Number(wallet?.balance || 0).toLocaleString()}đ
                    </p>
                </Card>
                <Card className="p-4 border-b-4 border-b-yellow-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Trạng thái ví</p>
                    <p className="text-xl font-black text-yellow-500">Hoạt động</p>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 smm-animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold mb-2">Tìm kiếm nhanh</label>
                        <Input
                            placeholder="Mã giao dịch, mô tả..."
                            prefix={<TbSearch className="text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="smm-input"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-semibold mb-2">Loại giao dịch</label>
                        <Select
                            options={transactionTypes}
                            value={transactionTypes.find(t => t.value === filterType)}
                            onChange={(option) => {
                                setFilterType((option as { value: string })?.value || 'all')
                                setPage(1)
                            }}
                        />
                    </div>
                </div>
            </Card>

            {/* Transactions Table */}
            <Card className="overflow-hidden smm-animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="text-left py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Mã giao dịch</th>
                                <th className="text-left py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Loại</th>
                                <th className="text-left py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Nội dung</th>
                                <th className="text-right py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Số tiền</th>
                                <th className="text-right py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Số dư cuối</th>
                                <th className="text-left py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="py-4 px-4">
                                            <Skeleton className="h-8 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-xs text-primary font-bold">{tx.transactionId}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(tx.type)}
                                                {getTypeBadge(tx.type)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 max-w-[250px] truncate text-sm">
                                            {tx.description}
                                        </td>
                                        <td className={`py-4 px-4 text-right font-black ${tx.type === 'ORDER' ? 'text-red-500' : 'text-green-500'}`}>
                                            {tx.type === 'ORDER' ? '-' : '+'}{Number(tx.amount).toLocaleString()}đ
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-gray-700 dark:text-gray-300">
                                            {Number(tx.balance).toLocaleString()}đ
                                        </td>
                                        <td className="py-4 px-4 text-xs text-gray-500">
                                            {dayjs(tx.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <TbHistory size={40} className="opacity-20" />
                                            <span>Chưa có dữ liệu giao dịch nào.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 gap-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Hiển thị {filteredTransactions.length} trên tổng số {pagination.total} giao dịch
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="default"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Trước
                            </Button>
                            <div className="flex items-center gap-1 px-2">
                                <span className="text-xs font-bold text-primary">{page}</span>
                                <span className="text-xs text-gray-400">/</span>
                                <span className="text-xs text-gray-400">{pagination.totalPages}</span>
                            </div>
                            <Button
                                size="sm"
                                variant="default"
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default WalletHistoryPage
