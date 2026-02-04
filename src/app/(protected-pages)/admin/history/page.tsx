'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Select, Skeleton, Pagination } from '@/components/ui'
import {
    TbSearch,
    TbFilter,
    TbDownload,
    TbRefresh,
    TbArrowUpRight,
    TbArrowDownLeft
} from 'react-icons/tb'
import useSWR from 'swr'
import dayjs from 'dayjs'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const AdminHistory = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const limit = 15

    const { data: response, isLoading, mutate } = useSWR(
        `/api/admin/history?q=${searchTerm}&page=${page}&limit=${limit}`,
        fetcher
    )
    const transactions = response?.data || []
    const pagination = response?.pagination

    return (
        <div className="space-y-6 smm-main-content">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold heading-text">Lịch Sử Giao Dịch</h1>
                    <p className="text-gray-500">Xem tất cả các giao dịch: nạp tiền, thanh toán, hoàn tiền.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" icon={<TbRefresh size={18} />} onClick={() => mutate()}>
                        Làm mới
                    </Button>
                </div>
            </div>

            <Card className="p-4 border-none shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Mã GD, Email khách..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-0 border-none shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Thời gian / Mã GD</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Khách hàng</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Loại</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Số tiền</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Mô tả</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Số dư sau</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {isLoading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-lg" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                    </tr>
                                ))
                            ) : (
                                transactions.map((txn: any) => (
                                    <tr key={txn.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{dayjs(txn.createdAt).format('DD/MM HH:mm')}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{txn.transactionId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{txn.user?.name || txn.user?.email.split('@')[0]}</p>
                                            <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{txn.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${txn.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                                                    txn.type === 'ORDER' ? 'bg-blue-100 text-blue-600' :
                                                        txn.type === 'REFUND' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-black ${['DEPOSIT', 'REFUND', 'BONUS'].includes(txn.type) ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            {['DEPOSIT', 'REFUND', 'BONUS'].includes(txn.type) ? '+' : '-'}
                                            {Number(txn.amount).toLocaleString()}đ
                                        </td>
                                        <td className="px-6 py-4 max-w-[250px] truncate">
                                            {txn.description}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-400">
                                            {Number(txn.balanceAfter).toLocaleString()}đ
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-bold uppercase">
                        Tổng cộng: {pagination?.total || 0} giao dịch
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
        </div>
    )
}

export default AdminHistory
