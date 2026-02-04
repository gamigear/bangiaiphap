import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// GET /api/lucky-wheel/config - Lấy cấu hình vòng quay và số lượt của user
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
            )
        }

        const config = await prisma.luckyWheelConfig.findFirst({
            where: { isActive: true },
        })

        if (!config) {
            return NextResponse.json(
                { success: false, error: 'Chưa có cấu hình vòng quay' },
                { status: 404 }
            )
        }

        // Đếm số lượt đã quay hôm nay
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const spinsToday = await prisma.luckyWheelSpin.count({
            where: {
                userId: session.user.id,
                createdAt: {
                    gte: startOfDay,
                },
            },
        })

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { purchasedSpins: true },
        })

        const spinsRemaining = Math.max(0, config.spinsPerDay - spinsToday) + (user?.purchasedSpins || 0)

        return NextResponse.json({
            success: true,
            data: {
                prizes: config.prizes,
                spinsRemaining,
                spinsPerDay: config.spinsPerDay,
                spinCost: Number(config.spinCost),
            },
        })
    } catch (error) {
        console.error('Error fetching lucky wheel config:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Không thể tải cấu hình vòng quay' },
            { status: 500 }
        )
    }
}
