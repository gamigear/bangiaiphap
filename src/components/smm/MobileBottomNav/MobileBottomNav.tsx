'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, MouseEvent } from 'react'
import {
    TbHome,
    TbLayoutGrid,
    TbShoppingCart,
    TbWallet,
    TbUser
} from 'react-icons/tb'

interface NavBadges {
    orders?: number
    notifications?: number
    wallet?: number
}

interface NavItem {
    href: string
    icon: typeof TbHome
    label: string
    activeMatch: string[]
    badgeKey?: keyof NavBadges
}

const navItems: NavItem[] = [
    {
        href: '/dashboard',
        icon: TbHome,
        label: 'Trang chủ',
        activeMatch: ['/dashboard', '/home']
    },
    {
        href: '/services',
        icon: TbLayoutGrid,
        label: 'Dịch vụ',
        activeMatch: ['/services']
    },
    {
        href: '/orders',
        icon: TbShoppingCart,
        label: 'Đơn hàng',
        activeMatch: ['/orders'],
        badgeKey: 'orders'
    },
    {
        href: '/wallet/deposit',
        icon: TbWallet,
        label: 'Ví tiền',
        activeMatch: ['/wallet'],
        badgeKey: 'wallet'
    },
    {
        href: '/support',
        icon: TbUser,
        label: 'Tài khoản',
        activeMatch: ['/support', '/api-partner', '/settings'],
        badgeKey: 'notifications'
    },
]

// Mock function to get badge counts - replace with real API later
const useBadgeCounts = (): NavBadges => {
    const [badges, setBadges] = useState<NavBadges>({
        orders: 0,
        notifications: 0,
        wallet: 0
    })

    useEffect(() => {
        // Simulate fetching badge counts
        const fetchBadges = () => {
            setBadges({
                orders: 3,
                notifications: 5,
                wallet: 0
            })
        }
        fetchBadges()
        const interval = setInterval(fetchBadges, 30000)
        return () => clearInterval(interval)
    }, [])

    return badges
}

interface BadgeProps {
    count: number
    className?: string
}

const Badge = ({ count, className = '' }: BadgeProps) => {
    if (count <= 0) return null
    const displayCount = count > 99 ? '99+' : count.toString()

    return (
        <span
            className={`
                absolute -top-1.5 -right-1.5 
                min-w-[18px] h-[18px] 
                flex items-center justify-center 
                text-[10px] font-bold text-white 
                bg-gradient-to-r from-red-500 to-pink-500
                rounded-full 
                px-1
                shadow-lg shadow-red-500/30
                animate-badge-pop
                ${className}
            `}
        >
            {displayCount}
        </span>
    )
}

interface RippleState {
    x: number
    y: number
    key: number
}

const MobileBottomNav = () => {
    const pathname = usePathname()
    const badges = useBadgeCounts()
    const [ripples, setRipples] = useState<{ [key: string]: RippleState }>({})
    const [pressedTab, setPressedTab] = useState<string | null>(null)

    const isActive = (item: NavItem) => {
        return item.activeMatch.some(path => pathname.startsWith(path))
    }

    const handleTouchStart = (href: string) => {
        setPressedTab(href)
    }

    const handleTouchEnd = () => {
        setPressedTab(null)
    }

    const handleClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setRipples(prev => ({
            ...prev,
            [href]: { x, y, key: Date.now() }
        }))

        // Clear ripple after animation
        setTimeout(() => {
            setRipples(prev => {
                const newRipples = { ...prev }
                delete newRipples[href]
                return newRipples
            })
        }, 600)
    }

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex justify-around items-center py-1.5 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item)
                    const badgeCount = item.badgeKey ? badges[item.badgeKey] || 0 : 0
                    const ripple = ripples[item.href]
                    const isPressed = pressedTab === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleClick(e, item.href)}
                            onTouchStart={() => handleTouchStart(item.href)}
                            onTouchEnd={handleTouchEnd}
                            onMouseDown={() => handleTouchStart(item.href)}
                            onMouseUp={handleTouchEnd}
                            onMouseLeave={handleTouchEnd}
                            className={`
                                relative flex flex-col items-center gap-0.5 
                                px-4 py-2 rounded-2xl 
                                transition-all duration-200 ease-out
                                min-w-[64px]
                                overflow-hidden
                                ${active
                                    ? 'text-primary'
                                    : 'text-gray-400 dark:text-gray-500'
                                }
                                ${isPressed ? 'scale-90' : 'scale-100'}
                            `}
                        >
                            {/* Ripple Effect */}
                            {ripple && (
                                <span
                                    key={ripple.key}
                                    className="absolute rounded-full bg-primary/20 pointer-events-none"
                                    style={{
                                        left: ripple.x,
                                        top: ripple.y,
                                        width: 10,
                                        height: 10,
                                        transform: 'translate(-50%, -50%)',
                                        animation: 'ripple 0.6s ease-out forwards'
                                    }}
                                />
                            )}

                            {/* Active Background */}
                            {active && (
                                <span
                                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl animate-tab-switch"
                                />
                            )}

                            {/* Icon Container */}
                            <div
                                className={`
                                    relative z-10
                                    transition-all duration-200
                                    ${active ? 'scale-110 -translate-y-0.5' : 'scale-100'}
                                    ${badgeCount > 0 && !active ? 'animate-bounce-gentle' : ''}
                                `}
                            >
                                <Icon
                                    size={24}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    className={`transition-all duration-200 ${active ? 'drop-shadow-sm' : ''}`}
                                />
                                <Badge count={badgeCount} />
                            </div>

                            {/* Label */}
                            <span
                                className={`
                                    relative z-10
                                    text-[10px] leading-tight
                                    transition-all duration-200
                                    ${active ? 'font-bold text-primary' : 'font-medium'}
                                `}
                            >
                                {item.label}
                            </span>

                            {/* Active Indicator Line */}
                            {active && (
                                <span className="smm-nav-indicator" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

export default MobileBottomNav
