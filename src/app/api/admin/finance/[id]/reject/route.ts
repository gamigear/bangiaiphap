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

        const transaction = await prisma.transaction.findUnique({
            where: { id }
        })

        if (!transaction) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy giao dịch' }, { status: 404 })
        }

        if (transaction.status !== 'PENDING') {
            return NextResponse.json({ success: false, error: 'Giao dịch đã được xử lý' }, { status: 400 })
        }

        // Reject: Just update status
        await prisma.transaction.update({
            where: { id },
            data: { status: 'CANCELLED' }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin reject deposit error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
