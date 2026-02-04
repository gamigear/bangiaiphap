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
        const body = await request.json()
        const { content } = body

        if (!content || !content.trim()) {
            return NextResponse.json({ success: false, error: 'Nội dung không được để trống' }, { status: 400 })
        }

        const ticket = await prisma.ticket.findUnique({ where: { id } })
        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy ticket' }, { status: 404 })
        }

        // Create reply and update ticket status
        await prisma.$transaction([
            prisma.ticketReply.create({
                data: {
                    ticketId: id,
                    userId: session.user.id!,
                    isAdmin: true,
                    message: content
                }
            }),
            prisma.ticket.update({
                where: { id },
                data: { status: 'PENDING' } // Waiting for user response
            })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin reply ticket error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
