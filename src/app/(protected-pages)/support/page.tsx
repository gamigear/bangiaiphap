'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import {
    PiHeadsetDuotone,
    PiPaperPlaneTiltDuotone,
    PiChatCircleDotsDuotone,
} from 'react-icons/pi'
import { FaTelegram, FaFacebookMessenger } from 'react-icons/fa6'

export default function SupportPage() {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [orderId, setOrderId] = useState('')

    const handleSubmit = () => {
        // TODO: Submit ticket
        console.log({ subject, message, orderId })
    }

    const tickets = [
        {
            id: 'TK-001',
            subject: 'Đơn hàng không chạy',
            status: 'open',
            createdAt: '2026-02-03 04:30:00',
        },
        {
            id: 'TK-002',
            subject: 'Yêu cầu hoàn tiền',
            status: 'replied',
            createdAt: '2026-02-02 15:00:00',
        },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold heading-text flex items-center gap-2">
                <PiHeadsetDuotone className="text-primary" />
                Hỗ Trợ
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Create Ticket */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold heading-text mb-4">
                            Tạo yêu cầu hỗ trợ mới
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Mã đơn hàng (nếu có)
                                </label>
                                <Input
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="VD: #ORD-001234"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Tiêu đề <span className="text-error">*</span>
                                </label>
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Mô tả ngắn gọn vấn đề của bạn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Nội dung <span className="text-error">*</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                    rows={5}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>

                            <Button
                                variant="solid"
                                icon={<PiPaperPlaneTiltDuotone />}
                                onClick={handleSubmit}
                            >
                                Gửi yêu cầu
                            </Button>
                        </div>
                    </Card>

                    {/* Ticket History */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold heading-text mb-4">
                            Lịch sử yêu cầu hỗ trợ
                        </h2>

                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-primary text-sm">
                                                {ticket.id}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${ticket.status === 'open'
                                                    ? 'bg-warning text-white'
                                                    : ticket.status === 'replied'
                                                        ? 'bg-success text-white'
                                                        : 'bg-gray-500 text-white'
                                                }`}>
                                                {ticket.status === 'open' ? 'Đang chờ' :
                                                    ticket.status === 'replied' ? 'Đã trả lời' : 'Đã đóng'}
                                            </span>
                                        </div>
                                        <p className="font-medium heading-text">{ticket.subject}</p>
                                        <p className="text-xs text-gray-400">{ticket.createdAt}</p>
                                    </div>
                                    <PiChatCircleDotsDuotone className="text-xl text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right - Contact Info */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold heading-text mb-4">
                            Liên hệ nhanh
                        </h2>

                        <div className="space-y-3">
                            <a
                                href="https://t.me/support"
                                target="_blank"
                                className="flex items-center gap-3 p-4 bg-[#0088CC]/10 rounded-lg hover:bg-[#0088CC]/20 transition-colors"
                            >
                                <FaTelegram className="text-2xl text-[#0088CC]" />
                                <div>
                                    <p className="font-medium heading-text">Telegram</p>
                                    <p className="text-sm text-gray-500">@bantuongtac_support</p>
                                </div>
                            </a>

                            <a
                                href="https://m.me/support"
                                target="_blank"
                                className="flex items-center gap-3 p-4 bg-[#0084FF]/10 rounded-lg hover:bg-[#0084FF]/20 transition-colors"
                            >
                                <FaFacebookMessenger className="text-2xl text-[#0084FF]" />
                                <div>
                                    <p className="font-medium heading-text">Messenger</p>
                                    <p className="text-sm text-gray-500">BanTuongTac Support</p>
                                </div>
                            </a>
                        </div>
                    </Card>

                    <Card className="p-6 bg-warning-subtle border border-warning">
                        <h3 className="font-semibold text-warning mb-2">⏰ Thời gian hỗ trợ</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            • Thứ 2 - Thứ 7: 8:00 - 22:00<br />
                            • Chủ nhật: 9:00 - 18:00
                        </p>
                    </Card>

                    <Card className="p-6 bg-info-subtle border border-info">
                        <h3 className="font-semibold text-info mb-2">💡 Lưu ý</h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Cung cấp đầy đủ thông tin đơn hàng</li>
                            <li>• Gửi kèm screenshot nếu có lỗi</li>
                            <li>• Thời gian phản hồi: 1-24 giờ</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    )
}
