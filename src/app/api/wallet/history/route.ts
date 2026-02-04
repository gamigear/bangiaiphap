import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// GET /api/wallet/history - Lấy lịch sử giao dịch
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: Record<string, unknown> = {
            userId: session.user.id,
        }

        if (type && type !== 'all') {
            where.type = type.toUpperCase()
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                items: transactions,
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json(
            { success: false, error: 'Không thể tải lịch sử giao dịch' },
            { status: 500 }
        )
    }
}
