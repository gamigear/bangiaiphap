'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TbMenu2, TbBell, TbWallet } from 'react-icons/tb'
import { userWallet } from '@/mock/smm'

interface MobileHeaderProps {
    onMenuToggle?: () => void
}

const MobileHeader = ({ onMenuToggle }: MobileHeaderProps) => {
    const [showNotifications, setShowNotifications] = useState(false)

    return (
        <header className="smm-mobile-header">
            {/* Menu Button */}
            <button
                onClick={onMenuToggle}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <TbMenu2 size={24} />
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    S
                </div>
                <span className="font-bold text-lg">SMM Panel</span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
                {/* Balance Badge */}
                <Link
                    href="/wallet/deposit"
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
                >
                    <TbWallet size={14} />
                    <span>{(userWallet.balance / 1000).toFixed(0)}K</span>
                </Link>

                {/* Notifications */}
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <TbBell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
            </div>

            {/* Notifications Dropdown - could be expanded */}
            {showNotifications && (
                <div className="absolute top-full right-4 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50">
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">Thông báo</h3>
                        <p className="text-sm text-gray-500">Chưa có thông báo mới</p>
                    </div>
                </div>
            )}
        </header>
    )
}

export default MobileHeader
