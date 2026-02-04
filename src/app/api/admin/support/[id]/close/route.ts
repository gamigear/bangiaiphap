import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.authority?.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
        }

        const { id } = await params

        const ticket = await prisma.ticket.findUnique({ where: { id } })
        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy ticket' }, { status: 404 })
        }

        await prisma.ticket.update({
            where: { id },
            data: { status: 'CLOSED' }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin close ticket error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
