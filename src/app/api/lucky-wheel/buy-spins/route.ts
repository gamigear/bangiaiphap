import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'

// POST /api/lucky-wheel/buy-spins - Mua thêm lượt quay
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
            )
        }

        const { amount = 1 } = await req.json()
        if (amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Số lượng mua không hợp lệ' },
                { status: 400 }
            )
        }

        const config = await prisma.luckyWheelConfig.findFirst({
            where: { isActive: true },
        })

        if (!config || !config.isActive) {
            return NextResponse.json(
                { success: false, error: 'Vòng quay hiện đang đóng' },
                { status: 400 }
            )
        }

        const totalCost = Number(config.spinCost) * amount

        // Thực hiện giao dịch
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId: session.user.id },
            })

            if (!wallet || Number(wallet.balance) < totalCost) {
                throw new Error('Số dư không đủ để mua lượt quay')
            }

            // 1. Trừ tiền ví
            const updatedWallet = await tx.wallet.update({
                where: { userId: session.user.id },
                data: {
                    balance: {
                        decrement: totalCost,
                    },
                    totalSpent: {
                        increment: totalCost,
                    },
                },
            })

            // 2. Tăng purchasedSpins của user
            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    purchasedSpins: {
                        increment: amount,
                    },
                },
            })

            // 3. Tạo record transaction
            await tx.transaction.create({
                data: {
                    transactionId: `BUY-SPIN-${Date.now()}`,
                    userId: session.user.id as string,
                    type: 'ORDER',
                    amount: -totalCost,
                    balanceAfter: updatedWallet.balance,
                    description: `Mua ${amount} lượt quay Vòng Quay May Mắn`,
                    status: 'COMPLETED',
                },
            })
        })

        return NextResponse.json({
            success: true,
            message: `Đã mua thành công ${amount} lượt quay`,
        })
    } catch (error: unknown) {
        console.error('Error buying spins:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi mua lượt quay' },
            { status: 500 }
        )
    }
}
