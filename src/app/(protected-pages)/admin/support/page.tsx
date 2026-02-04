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
import { HiSearch, HiReply, HiCheck, HiClock, HiExclamation } from 'react-icons/hi'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'OPEN', label: 'Đang mở' },
    { value: 'PENDING', label: 'Chờ phản hồi' },
    { value: 'RESOLVED', label: 'Đã giải quyết' },
    { value: 'CLOSED', label: 'Đã đóng' },
]

const priorityOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'LOW', label: 'Thấp' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'HIGH', label: 'Cao' },
    { value: 'URGENT', label: 'Khẩn cấp' },
]

export default function AdminSupportPage() {
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedTicket, setSelectedTicket] = useState<any>(null)
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: ticketsData, mutate } = useSWR(
        `/api/admin/support?status=${statusFilter}&priority=${priorityFilter}&search=${search}`,
        fetcher
    )

    const { data: statsData } = useSWR('/api/admin/support/stats', fetcher)

    const tickets = ticketsData?.data || []
    const stats = statsData?.data || {
        total: 0,
        open: 0,
        pending: 0,
        resolved: 0
    }

    const handleReply = async () => {
        if (!selectedTicket || !replyContent.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/admin/support/${selectedTicket.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyContent })
            })
            const data = await res.json()
            if (data.success) {
                toast.push(<Notification type="success" title="Đã gửi phản hồi" />)
                setIsReplyModalOpen(false)
                setReplyContent('')
                setSelectedTicket(null)
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

    const handleCloseTicket = async (ticketId: string) => {
        try {
            const res = await fetch(`/api/admin/support/${ticketId}/close`, {
                method: 'POST'
            })
            const data = await res.json()
            if (data.success) {
                toast.push(<Notification type="success" title="Đã đóng ticket" />)
                mutate()
            } else {
                toast.push(<Notification type="danger" title={data.error} />)
            }
        } catch {
            toast.push(<Notification type="danger" title="Có lỗi xảy ra" />)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            OPEN: 'bg-blue-100 text-blue-800',
            PENDING: 'bg-amber-100 text-amber-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-gray-100 text-gray-800',
        }
        const labels: Record<string, string> = {
            OPEN: 'Đang mở',
            PENDING: 'Chờ phản hồi',
            RESOLVED: 'Đã giải quyết',
            CLOSED: 'Đã đóng',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        )
    }

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            LOW: 'bg-gray-100 text-gray-800',
            MEDIUM: 'bg-blue-100 text-blue-800',
            HIGH: 'bg-orange-100 text-orange-800',
            URGENT: 'bg-red-100 text-red-800',
        }
        const labels: Record<string, string> = {
            LOW: 'Thấp',
            MEDIUM: 'Trung bình',
            HIGH: 'Cao',
            URGENT: 'Khẩn cấp',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || 'bg-gray-100'}`}>
                {labels[priority] || priority}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý Hỗ trợ</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiExclamation className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Tổng ticket</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiClock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Đang mở</p>
                            <p className="text-2xl font-bold">{stats.open}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiReply className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Chờ phản hồi</p>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <HiCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-80">Đã giải quyết</p>
                            <p className="text-2xl font-bold">{stats.resolved}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Tìm theo tiêu đề, email..."
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
                            options={priorityOptions}
                            value={priorityOptions.find(o => o.value === priorityFilter)}
                            onChange={(option: any) => setPriorityFilter(option.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Tickets Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">ID</th>
                                <th className="text-left py-3 px-4">Tiêu đề</th>
                                <th className="text-left py-3 px-4">Người gửi</th>
                                <th className="text-left py-3 px-4">Ưu tiên</th>
                                <th className="text-left py-3 px-4">Trạng thái</th>
                                <th className="text-left py-3 px-4">Thời gian</th>
                                <th className="text-center py-3 px-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket: any) => (
                                <tr key={ticket.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="py-3 px-4 font-mono text-sm">#{ticket.id.slice(0, 8)}</td>
                                    <td className="py-3 px-4">
                                        <p className="font-medium max-w-[200px] truncate">{ticket.subject}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">{ticket.user?.name || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{ticket.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">{getPriorityBadge(ticket.priority)}</td>
                                    <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                                    <td className="py-3 px-4 text-sm">
                                        {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                size="xs"
                                                variant="solid"
                                                icon={<HiReply />}
                                                onClick={() => {
                                                    setSelectedTicket(ticket)
                                                    setIsReplyModalOpen(true)
                                                }}
                                            >
                                                Trả lời
                                            </Button>
                                            {ticket.status !== 'CLOSED' && (
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    onClick={() => handleCloseTicket(ticket.id)}
                                                >
                                                    Đóng
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        Không có ticket nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Reply Modal */}
            <Dialog isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)}>
                <h3 className="text-lg font-bold mb-4">Trả lời ticket</h3>
                {selectedTicket && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="font-medium">{selectedTicket.subject}</p>
                            <p className="text-sm text-gray-500 mt-1">{selectedTicket.user?.email}</p>
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-sm whitespace-pre-wrap">{selectedTicket.content}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nội dung phản hồi</label>
                            <textarea
                                className="w-full p-3 border rounded-lg min-h-[120px] dark:bg-gray-800 dark:border-gray-700"
                                placeholder="Nhập nội dung phản hồi..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setIsReplyModalOpen(false)}>Hủy</Button>
                            <Button
                                variant="solid"
                                loading={isSubmitting}
                                onClick={handleReply}
                            >
                                Gửi phản hồi
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}
