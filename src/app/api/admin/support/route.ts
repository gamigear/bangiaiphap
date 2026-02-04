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
        const priority = searchParams.get('priority') || 'all'
        const search = searchParams.get('search') || ''

        const where: any = {}

        if (status !== 'all') {
            where.status = status
        }

        if (priority !== 'all') {
            where.priority = priority
        }

        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ]
        }

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                user: {
                    select: { id: true, email: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        return NextResponse.json({ success: true, data: tickets })
    } catch (error) {
        console.error('Admin support error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
