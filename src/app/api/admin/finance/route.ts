import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.authority?.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'all'
        const type = searchParams.get('type') || 'all'
        const search = searchParams.get('search') || ''

        const where: any = {}

        if (status !== 'all') {
            where.status = status
        }

        if (type !== 'all') {
            where.type = type
        }

        if (search) {
            where.OR = [
                { transactionId: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ]
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                user: {
                    select: { id: true, email: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        return NextResponse.json({ success: true, data: transactions })
    } catch (error) {
        console.error('Admin finance error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
