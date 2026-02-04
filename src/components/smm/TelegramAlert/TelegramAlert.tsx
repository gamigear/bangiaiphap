'use client'

import { Alert } from '@/components/ui'
import Link from 'next/link'
import { PiTelegramLogoDuotone } from 'react-icons/pi'

export default function TelegramAlert() {
    return (
        <Alert
            showIcon
            type="info"
            customIcon={<PiTelegramLogoDuotone className="text-xl" />}
            className="mb-6"
        >
            <span>
                Tài khoản của bạn chưa được xác minh Telegram, truy cập vào{' '}
                <Link href="/telegram-verify" className="text-primary font-semibold underline">
                    BOT Telegram
                </Link>{' '}
                để xác minh để bảo mật và quản lý toàn bộ thông tin đơn hàng như Hủy Đơn Hoàn Tiền tự động, Bảo Hành Đơn tự động, xem trạng thái đơn hàng...
            </span>
        </Alert>
    )
}
