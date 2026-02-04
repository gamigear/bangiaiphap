'use client'

import { TbWallet, TbCash, TbCrown, TbTrendingUp, TbArrowUpRight } from 'react-icons/tb'
import type { UserTier } from '@/@types/smm'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    variant?: 'primary' | 'success' | 'warning' | 'gold'
    trend?: number
    subtitle?: string
}

const StatCard = ({ title, value, icon, variant = 'primary', trend, subtitle }: StatCardProps) => {
    const iconBgColors = {
        primary: 'smm-stat-icon primary',
        success: 'smm-stat-icon success',
        warning: 'smm-stat-icon warning',
        gold: 'smm-stat-icon gold',
    }

    return (
        <div className="relative z-10">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <TbTrendingUp className={trend < 0 ? 'rotate-180' : ''} />
                            <span>{Math.abs(trend)}% so với hôm qua</span>
                        </div>
                    )}
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={iconBgColors[variant]}>
                    {icon}
                </div>
            </div>
            <button className="mt-4 flex items-center gap-1 text-sm text-primary hover:text-primary-deep transition-colors font-medium group">
                Xem chi tiết
                <TbArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
    )
}

// Pre-configured stat cards for SMM Panel
interface BalanceCardProps {
    balance: number
}

export const BalanceCard = ({ balance }: BalanceCardProps) => (
    <StatCard
        title="Số dư"
        value={`${balance.toLocaleString()} VND`}
        icon={<TbWallet className="text-white" />}
        variant="primary"
        subtitle="Số dư hiện tại"
    />
)

interface TotalDepositCardProps {
    totalDeposit: number
}

export const TotalDepositCard = ({ totalDeposit }: TotalDepositCardProps) => (
    <StatCard
        title="Tổng nạp"
        value={`${totalDeposit.toLocaleString()} VND`}
        icon={<TbCash className="text-white" />}
        variant="success"
        trend={12}
    />
)

interface TierCardProps {
    tier: UserTier
}

const tierNames: Record<UserTier, string> = {
    ADMIN: 'Quản trị viên',
    MEMBER: 'Thành viên',
    VIP: 'VIP',
    RESELLER: 'Đại lý',
    AGENCY: 'Tổng đại lý',
}

const tierIcons: Record<UserTier, string> = {
    ADMIN: '⚡',
    MEMBER: '🥉',
    VIP: '🥈',
    RESELLER: '🥇',
    AGENCY: '👑',
}

export const TierCard = ({ tier }: TierCardProps) => (
    <StatCard
        title="Cấp bậc"
        value={`${tierIcons[tier] || '🥉'} ${tierNames[tier] || 'Thành viên'}`}
        icon={<TbCrown className="text-white" />}
        variant="gold"
        subtitle="Nâng cấp để được ưu đãi hơn"
    />
)

export default StatCard
