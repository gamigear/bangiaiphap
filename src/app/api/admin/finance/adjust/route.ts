import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.authority?.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
        }

        const body = await request.json()
        const { userId, amount, type, note } = body

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json({ success: false, error: 'Thông tin không hợp lệ' }, { status: 400 })
        }

        const wallet = await prisma.wallet.findUnique({ where: { userId } })
        if (!wallet) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy ví người dùng' }, { status: 404 })
        }

        const currentBalance = Number(wallet.balance)
        let newBalance: number

        if (type === 'add') {
            newBalance = currentBalance + amount
        } else {
            if (currentBalance < amount) {
                return NextResponse.json({ success: false, error: 'Số dư không đủ để trừ' }, { status: 400 })
            }
            newBalance = currentBalance - amount
        }

        // Update wallet and create transaction
        await prisma.$transaction([
            prisma.wallet.update({
                where: { userId },
                data: {
                    balance: newBalance,
                    ...(type === 'add' ? { totalDeposit: { increment: amount } } : {})
                }
            }),
            prisma.transaction.create({
                data: {
                    transactionId: `MANUAL${Date.now()}`,
                    userId,
                    type: 'MANUAL',
                    amount: amount,
                    balanceAfter: newBalance,
                    description: note || (type === 'add' ? 'Cộng tiền thủ công' : 'Trừ tiền thủ công'),
                    status: 'COMPLETED'
                }
            })
        ])

        return NextResponse.json({ success: true, data: { newBalance } })
    } catch (error) {
        console.error('Admin adjust balance error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
