import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const where: any = {}
        if (q) {
            where.OR = [
                { email: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } }
            ]
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    wallet: true,
                    _count: {
                        select: { orders: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: users.map((user: any) => ({
                ...user,
                balance: Number(user.wallet?.balance || 0),
                totalDeposit: Number(user.wallet?.totalDeposit || 0),
                totalSpent: Number(user.wallet?.totalSpent || 0),
                orderCount: user._count.orders
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Admin users error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
