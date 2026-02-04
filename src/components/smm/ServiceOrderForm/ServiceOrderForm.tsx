'use client'

import { useState, useMemo } from 'react'
import { Card, Button, Input, Radio, Notification, toast, Skeleton } from '@/components/ui'
import { useWallet } from '@/hooks/api'
import {
    PiShoppingCartDuotone,
    PiInfoDuotone,
    PiWarningDuotone,
    PiWalletDuotone,
} from 'react-icons/pi'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'

interface ServiceOrderFormProps {
    service: any // Use any for now or define a proper type
}

export default function ServiceOrderForm({ service }: ServiceOrderFormProps) {
    const router = useRouter()
    const { wallet, isLoading: walletLoading, mutate: mutateWallet } = useWallet()

    const [link, setLink] = useState('')
    const [selectedServer, setSelectedServer] = useState<any>(service.servers[0])
    const [quantity, setQuantity] = useState(selectedServer?.minQuantity?.toString() || '0')
    const [discount, setDiscount] = useState('')
    const [note, setNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const totalPrice = useMemo(() => {
        const qty = parseInt(quantity) || 0
        return Math.round((qty / 1000) * (selectedServer?.price || 0))
    }, [quantity, selectedServer])

    const handleSubmit = async () => {
        if (!link) {
            toast.push(<Notification title="Lỗi" type="danger">Vui lòng nhập link hoặc ID</Notification>)
            return
        }

        const qty = parseInt(quantity)
        if (!qty || qty < selectedServer.minQuantity || qty > selectedServer.maxQuantity) {
            toast.push(<Notification title="Lỗi" type="danger">Số lượng không hợp lệ</Notification>)
            return
        }

        if (wallet && wallet.balance < totalPrice) {
            toast.push(<Notification title="Lỗi" type="danger">Số dư ví không đủ</Notification>)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service.id,
                    serverId: selectedServer.id,
                    link,
                    quantity: qty,
                    note,
                    discountCode: discount
                })
            })

            const result = await res.json()

            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        Đặt hàng thành công! Đang chuyển đến lịch sử đơn hàng...
                    </Notification>
                )
                mutateWallet()
                setTimeout(() => router.push('/orders'), 2000)
            } else {
                toast.push(<Notification title="Lỗi" type="danger">{result.error || 'Đặt hàng thất bại'}</Notification>)
            }
        } catch (error) {
            toast.push(<Notification title="Lỗi" type="danger">Có lỗi xảy ra, vui lòng thử lại sau</Notification>)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!selectedServer) return <Skeleton className="h-[600px] w-full" />

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 smm-animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Link Hoặc UID:
                        </label>
                        <Input
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="Nhập link bài viết, link trang cá nhân hoặc UID..."
                            className="smm-input"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Chọn Máy Chủ:
                        </label>
                        <div className="space-y-3">
                            {service.servers.map((server: any) => (
                                <div
                                    key={server.id}
                                    onClick={() => {
                                        setSelectedServer(server)
                                        setQuantity(server.minQuantity.toString())
                                    }}
                                    className={classNames(
                                        'border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 relative overflow-hidden',
                                        selectedServer.id === server.id
                                            ? 'border-primary bg-primary-subtle/30 ring-2 ring-primary/20'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/20'
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    MÁY CHỦ {server.id.split('-').pop()?.toUpperCase()}
                                                </span>
                                                <span className="font-bold heading-text text-base">
                                                    {server.name}
                                                </span>
                                                {server.isRecommended && (
                                                    <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full border border-success/20">
                                                        🔥 CỰC NHANH
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-primary font-bold">{server.price.toLocaleString('vi-VN')}đ</span>
                                                    <span>/ 1000</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="opacity-60">Tốc độ:</span>
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{server.speed}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="opacity-60">Chất lượng:</span>
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{server.quality}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Radio
                                                checked={selectedServer.id === server.id}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {selectedServer.id === server.id && (
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-full flex items-center justify-center pl-2 pb-2">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Số lượng:
                            </label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={`Tối thiểu ${selectedServer.minQuantity.toLocaleString()}`}
                                min={selectedServer.minQuantity}
                                max={selectedServer.maxQuantity}
                                className="smm-input"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                                Min: {selectedServer.minQuantity.toLocaleString()} - Max: {selectedServer.maxQuantity.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Mã giảm giá:
                            </label>
                            <Input
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                placeholder="Nhập coupon (nếu có)"
                                className="smm-input"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Ghi chú đơn hàng:
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ghi chú cho admin hoặc hệ thống xử lý..."
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-[100px] transition-all"
                            rows={3}
                        />
                    </div>

                    <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 text-center shadow-lg shadow-primary/20 mb-6">
                        <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-widest">TỔNG THANH TOÁN</p>
                        <h2 className="text-3xl font-black text-white">
                            {totalPrice.toLocaleString('vi-VN')} <span className="text-lg">VND</span>
                        </h2>
                    </div>

                    <Button
                        block
                        variant="solid"
                        size="lg"
                        loading={isSubmitting}
                        onClick={handleSubmit}
                        icon={<PiShoppingCartDuotone size={20} />}
                        className="smm-btn-glow py-4 text-base font-bold"
                    >
                        XÁC NHẬN ĐẶT HÀNG
                    </Button>
                </Card>

                {/* FAQ Section */}
                {service.faqs && service.faqs.length > 0 && (
                    <Card className="p-6 smm-animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-lg font-bold heading-text mb-6 flex items-center gap-2">
                            <PiInfoDuotone className="text-primary" />
                            Câu Hỏi Thường Gặp
                        </h3>
                        <div className="space-y-4">
                            {service.faqs.map((item: any, index: number) => (
                                <details key={index} className="group border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                                    <summary className="flex justify-between items-center cursor-pointer list-none py-4 px-6 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <span className="font-semibold heading-text">
                                            {item.question}
                                        </span>
                                        <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">
                                            ▼
                                        </span>
                                    </summary>
                                    <div className="p-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 leading-relaxed bg-white dark:bg-gray-900">
                                        {item.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 smm-animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <Button block variant="default" onClick={() => router.push('/orders/history')} className="py-3 border-2 border-primary/20 hover:border-primary/50">
                    📋 XEM LỊCH SỬ ĐƠN HÀNG
                </Button>

                <Card className="p-5 border-l-4 border-l-primary relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-primary/5 opacity-10">
                        <PiWalletDuotone size={100} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black">
                            {wallet?.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-bold heading-text text-lg">{wallet?.user?.name || 'Tài khoản'}</p>
                            <p className="text-xs text-gray-400">{wallet?.user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="text-gray-500 text-sm">Số dư hiện tại:</span>
                            <span className="font-black text-primary text-base">
                                {walletLoading ? '...' : Number(wallet?.balance || 0).toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-gray-500 text-xs">Cấp bậc:</span>
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/50">
                                {walletLoading ? '...' : wallet?.user?.tier || 'THÀNH VIÊN'}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-indigo-600/5 to-primary/5 border border-primary/10">
                    <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                        <PiInfoDuotone size={18} /> HƯỚNG DẪN CHI TIẾT
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        "{service.description || 'Vui lòng đọc kỹ thông tin phía trên của từng máy chủ trước khi đặt hàng.'}"
                    </p>
                </Card>

                <Card className="p-5 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30">
                    <h4 className="font-bold text-red-600 dark:text-red-500 mb-3 flex items-center gap-2 uppercase text-xs tracking-widest">
                        <PiWarningDuotone size={18} /> Lưu ý quan trọng
                    </h4>
                    <ul className="text-[11px] text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
                        <li>Không cài 2 đơn cùng 1 link cho cùng 1 loại dịch vụ trên hệ thống.</li>
                        <li>Đơn đã đặt không thể hoàn tiền nếu bạn nhập sai thông tin.</li>
                        <li>Nếu dịch vụ bảo trì, thời gian hoàn thành có thể chậm hơn dự kiến.</li>
                        <li>Liên hệ hỗ trợ nếu đơn hàng quá 24h chưa được xử lý.</li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}
