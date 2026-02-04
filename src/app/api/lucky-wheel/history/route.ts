import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { LuckyWheelSpin } from '@prisma/client'

// GET /api/lucky-wheel/history - Lấy lịch sử quay thưởng của user
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
            )
        }

        const history = await prisma.luckyWheelSpin.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        })

        return NextResponse.json({
            success: true,
            data: history.map((h: LuckyWheelSpin) => ({
                id: h.id,
                prize: h.prize,
                amount: Number(h.amount),
                createdAt: h.createdAt,
            })),
        })
    } catch (error) {
        console.error('Error fetching lucky wheel history:', error)
        return NextResponse.json(
            { success: false, error: 'Không thể tải lịch sử quay thưởng' },
            { status: 500 }
        )
    }
}
