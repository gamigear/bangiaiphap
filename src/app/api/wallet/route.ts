import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// GET /api/wallet - Lấy thông tin wallet của user
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
            )
        }

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
        })

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId: session.user.id,
                    balance: 0,
                    totalDeposit: 0,
                    totalSpent: 0,
                },
            })
        }

        // Get additional stats
        const [pendingOrders, completedOrders, totalOrders] = await Promise.all([
            prisma.order.count({
                where: {
                    userId: session.user.id,
                    status: { in: ['PENDING', 'PROCESSING', 'IN_PROGRESS'] },
                },
            }),
            prisma.order.count({
                where: {
                    userId: session.user.id,
                    status: 'COMPLETED',
                },
            }),
            prisma.order.count({
                where: { userId: session.user.id },
            }),
        ])

        // Get user tier
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { tier: true },
        })

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                },
                balance: wallet.balance,
                totalDeposit: wallet.totalDeposit,
                totalSpent: wallet.totalSpent,
                tier: user?.tier || 'MEMBER',
                pendingOrders,
                completedOrders,
                totalOrders,
            },
        })
    } catch (error) {
        console.error('Error fetching wallet:', error)
        return NextResponse.json(
            { success: false, error: 'Không thể tải thông tin ví' },
            { status: 500 }
        )
    }
}
