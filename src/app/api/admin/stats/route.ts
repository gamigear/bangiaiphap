import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()

        // Kiểm tra quyền admin (authority được set trong validateCredential)
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const [userCount, orderCount, totalWallet, recentOrders, recentUsers] = await Promise.all([
            prisma.user.count(),
            prisma.order.count(),
            prisma.wallet.aggregate({
                _sum: {
                    balance: true,
                    totalDeposit: true,
                    totalSpent: true
                }
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { email: true, name: true } },
                    service: { select: { name: true } }
                }
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    tier: true,
                    createdAt: true
                }
            })
        ])

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalUsers: userCount,
                    totalOrders: orderCount,
                    systemBalance: Number(totalWallet._sum.balance || 0),
                    totalRevenue: Number(totalWallet._sum.totalSpent || 0),
                    totalDeposit: Number(totalWallet._sum.totalDeposit || 0)
                },
                recentOrders: recentOrders.map((o: any) => ({
                    ...o,
                    totalPrice: Number(o.totalPrice)
                })),
                recentUsers
            }
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
