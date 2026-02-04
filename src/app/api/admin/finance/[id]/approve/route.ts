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
            where: { id },
            include: { user: true }
        })

        if (!transaction) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy giao dịch' }, { status: 404 })
        }

        if (transaction.status !== 'PENDING') {
            return NextResponse.json({ success: false, error: 'Giao dịch đã được xử lý' }, { status: 400 })
        }

        const wallet = await prisma.wallet.findUnique({ where: { userId: transaction.userId } })
        if (!wallet) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy ví' }, { status: 404 })
        }

        const newBalance = Number(wallet.balance) + Number(transaction.amount)

        // Approve: Update transaction and add balance
        await prisma.$transaction([
            prisma.transaction.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    balanceAfter: newBalance
                }
            }),
            prisma.wallet.update({
                where: { userId: transaction.userId },
                data: {
                    balance: newBalance,
                    totalDeposit: { increment: Number(transaction.amount) }
                }
            })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin approve deposit error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
