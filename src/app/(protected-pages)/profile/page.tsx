'use client'

import { useState } from 'react'
import { Card, Button, Input, Skeleton, Notification, toast, Dialog } from '@/components/ui'
import { useWallet } from '@/hooks/api'
import useSWR from 'swr'
import {
    TbUser,
    TbMail,
    TbKey,
    TbPlus,
    TbTrash,
    TbCopy,
    TbCheck,
    TbShieldCheck,
    TbWallet,
    TbArrowUpRight
} from 'react-icons/tb'
import dayjs from 'dayjs'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProfilePage() {
    const { wallet, isLoading: walletLoading } = useWallet()
    const { data: keysData, mutate: mutateKeys } = useSWR('/api/user/keys', fetcher)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [copied, setCopied] = useState<string | null>(null)

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        toast.push(<Notification title="Đã sao chép" type="success" />)
        setTimeout(() => setCopied(null), 2000)
    }

    const handleCreateKey = async () => {
        if (!newKeyName) return
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/user/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            })
            const result = await res.json()
            if (result.success) {
                toast.push(<Notification title="Thành công" type="success">Đã tạo API key mới</Notification>)
                mutateKeys()
                setIsCreateModalOpen(false)
                setNewKeyName('')
            } else {
                toast.push(<Notification title="Lỗi" type="danger">{result.error}</Notification>)
            }
        } catch (error) {
            toast.push(<Notification title="Lỗi" type="danger">Có lỗi xảy ra</Notification>)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteKey = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa API key này? Các ứng dụng đang sử dụng key này sẽ ngừng hoạt động.')) return
        try {
            const res = await fetch(`/api/user/keys?id=${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.success) {
                toast.push(<Notification title="Đã xóa" type="success" />)
                mutateKeys()
            }
        } catch (error) {
            toast.push(<Notification title="Lỗi" type="danger">Không thể xóa</Notification>)
        }
    }

    return (
        <div className="space-y-6 smm-main-content">
            <div className="smm-animate-fadeInUp">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <TbUser className="text-primary" />
                    Trang cá nhân
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Quản lý thông tin tài khoản và cấu hình API
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Personal Info */}
                <Card className="p-6 lg:col-span-1 smm-animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-black mb-4 border-4 border-white dark:border-gray-800 shadow-xl">
                            {wallet?.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <h2 className="text-xl font-bold heading-text">{wallet?.user?.name || 'Tài khoản'}</h2>
                        <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/50 mt-2 font-bold uppercase tracking-wider">
                            {wallet?.tier || 'THÀNH VIÊN'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <TbMail size={12} /> Email
                            </p>
                            <p className="text-sm font-medium">{wallet?.user?.email || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <TbShieldCheck size={12} /> Trạng thái
                            </p>
                            <p className="text-sm font-medium text-success">Đã kích hoạt</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 group cursor-pointer hover:bg-primary/10 transition-all">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest mb-1">Số dư hiện tại</p>
                                    <p className="text-2xl font-black text-primary">
                                        {Number(wallet?.balance || 0).toLocaleString('vi-VN')} <span className="text-sm">đ</span>
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                                    <TbWallet size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right - API Keys */}
                <div className="lg:col-span-2 space-y-6 smm-animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <TbKey className="text-primary" />
                                    API Kết nối
                                </h3>
                                <p className="text-xs text-gray-400">Kết nối với ứng dụng của bạn để tự động hóa đơn hàng</p>
                            </div>
                            <Button
                                size="sm"
                                variant="solid"
                                icon={<TbPlus />}
                                onClick={() => setIsCreateModalOpen(true)}
                                className="smm-btn-glow"
                            >
                                Tạo API Key
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {!keysData ? (
                                [...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                            ) : keysData.data?.length > 0 ? (
                                keysData.data.map((k: any) => (
                                    <div key={k.id} className="p-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/50 transition-all">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-sm">{k.name}</span>
                                                <span className={`w-2 h-2 rounded-full ${k.isActive ? 'bg-success' : 'bg-error'}`} />
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg font-mono text-xs overflow-hidden relative group/key">
                                                <span className="truncate border-r border-gray-200 dark:border-gray-700 pr-2">
                                                    {k.key}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(k.key, k.id)}
                                                    className="pl-2 text-primary hover:scale-110 transition-transform"
                                                >
                                                    {copied === k.id ? <TbCheck /> : <TbCopy />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <div className="text-right">
                                                <p>Đã tạo: {dayjs(k.createdAt).format('DD/MM/YYYY')}</p>
                                                <p>Sử dụng: {k.lastUsed ? dayjs(k.lastUsed).fromNow() : 'Chưa sử dụng'}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteKey(k.id)}
                                                className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all shadow-sm"
                                            >
                                                <TbTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <TbKey className="mx-auto text-4xl mb-2 opacity-10" />
                                    <p className="text-gray-400 text-sm italic">Bạn chưa tạo API key nào. Tạo key để bắt đầu kết nối!</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                                    Tài liệu API <TbArrowUpRight />
                                </h4>
                                <p className="text-white/80 text-sm leading-relaxed max-w-md">
                                    Chúng tôi hỗ trợ kết nối API cho tất cả các dịch vụ. Bạn có thể tích hợp vào website cá nhân hoặc hệ thống của bạn một cách dễ dàng.
                                </p>
                            </div>
                            <Button className="bg-white text-indigo-600 border-none hover:bg-white/90 font-bold px-8">
                                Xem tài liệu
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create API Key Modal */}
            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                width={400}
            >
                <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-4">Tạo API Key mới</h3>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Tên gợi nhớ (VD: Web của tôi, Tools TikTok)
                        </label>
                        <Input
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="Nhập tên ứng dụng..."
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 justify-end mt-6">
                        <Button variant="plain" onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
                        <Button variant="solid" loading={isSubmitting} onClick={handleCreateKey}>Tạo ngay</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
