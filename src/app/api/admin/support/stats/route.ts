import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.authority?.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
        }

        const [total, open, pending, resolved] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: 'OPEN' } }),
            prisma.ticket.count({ where: { status: 'PENDING' } }),
            prisma.ticket.count({ where: { status: 'RESOLVED' } }),
        ])

        return NextResponse.json({
            success: true,
            data: { total, open, pending, resolved }
        })
    } catch (error) {
        console.error('Admin support stats error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
