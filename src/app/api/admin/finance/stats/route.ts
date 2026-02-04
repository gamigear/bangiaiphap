import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.authority?.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
        }

        // Get today's start
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Total deposits
        const totalDepositResult = await prisma.transaction.aggregate({
            where: { type: 'DEPOSIT', status: 'COMPLETED' },
            _sum: { amount: true }
        })

        // Total spent (orders)
        const totalSpentResult = await prisma.transaction.aggregate({
            where: { type: 'ORDER', status: 'COMPLETED' },
            _sum: { amount: true }
        })

        // Pending deposits
        const pendingDepositsResult = await prisma.transaction.aggregate({
            where: { type: 'DEPOSIT', status: 'PENDING' },
            _sum: { amount: true }
        })

        // Today's revenue (completed orders)
        const todayRevenueResult = await prisma.transaction.aggregate({
            where: {
                type: 'ORDER',
                status: 'COMPLETED',
                createdAt: { gte: today }
            },
            _sum: { amount: true }
        })

        return NextResponse.json({
            success: true,
            data: {
                totalDeposit: Number(totalDepositResult._sum.amount || 0),
                totalSpent: Number(totalSpentResult._sum.amount || 0),
                pendingDeposits: Number(pendingDepositsResult._sum.amount || 0),
                todayRevenue: Number(todayRevenueResult._sum.amount || 0)
            }
        })
    } catch (error) {
        console.error('Admin finance stats error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
