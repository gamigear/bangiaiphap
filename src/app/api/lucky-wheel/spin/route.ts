import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'

// POST /api/lucky-wheel/spin - Thực hiện quay vòng quay
export async function POST() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
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

        // Kiểm tra lượt quay trong ngày
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const spinsToday = await prisma.luckyWheelSpin.count({
            where: {
                userId: session.user.id,
                createdAt: {
                    gte: startOfDay,
                },
            },
        })

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { purchasedSpins: true },
        })

        const isFreeSpin = spinsToday < config.spinsPerDay

        if (!isFreeSpin && (!user?.purchasedSpins || user.purchasedSpins <= 0)) {
            return NextResponse.json(
                { success: false, error: 'Bạn đã hết lượt quay' },
                { status: 400 }
            )
        }

        // Logic quay thưởng
        const prizes = config.prizes as { label: string, amount: number, probability: number }[]
        const random = Math.random() * 100
        let cumulative = 0
        let selectedPrize = prizes[0]

        for (const prize of prizes) {
            cumulative += prize.probability
            if (random <= cumulative) {
                selectedPrize = prize
                break
            }
        }

        // Lưu kết quả và cộng tiền vào ví
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 0. Giảm lượt quay nếu không phải lượt miễn phí
            if (!isFreeSpin) {
                await tx.user.update({
                    where: { id: session.user.id },
                    data: {
                        purchasedSpins: {
                            decrement: 1,
                        },
                    },
                })
            }

            // 1. Tạo bản ghi lượt quay
            const spin = await tx.luckyWheelSpin.create({
                data: {
                    userId: session.user.id as string,
                    prize: selectedPrize.label,
                    amount: selectedPrize.amount,
                },
            })

            // 2. Cộng tiền vào ví
            const wallet = await tx.wallet.update({
                where: { userId: session.user.id as string },
                data: {
                    balance: {
                        increment: selectedPrize.amount,
                    },
                },
            })

            // 3. Tạo transaction history
            await tx.transaction.create({
                data: {
                    transactionId: `LUCKY-${Date.now()}`,
                    userId: session.user.id as string,
                    type: 'BONUS',
                    amount: selectedPrize.amount,
                    balanceAfter: wallet.balance,
                    description: `Trúng thưởng từ Vòng Quay May Mắn: ${selectedPrize.label}`,
                    status: 'COMPLETED',
                },
            })

            return spin
        })

        return NextResponse.json({
            success: true,
            data: {
                prize: selectedPrize.label,
                amount: Number(selectedPrize.amount),
                spinId: result.id,
            },
        })
    } catch (error) {
        console.error('Error spinning lucky wheel:', error)
        return NextResponse.json(
            { success: false, error: 'Có lỗi xảy ra khi quay thưởng' },
            { status: 500 }
        )
    }
}
