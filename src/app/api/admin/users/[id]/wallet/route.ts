import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const userId = params.id
        const body = await request.json()
        const { amount, type, description } = body

        if (amount === undefined || isNaN(Number(amount))) {
            return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true }
        })

        if (!user || !user.wallet) {
            return NextResponse.json({ success: false, error: 'User wallet not found' }, { status: 404 })
        }

        const changeAmount = Number(amount)
        const newBalance = Number(user.wallet.balance) + changeAmount

        if (newBalance < 0) {
            return NextResponse.json({ success: false, error: 'Insufficient balance after update' }, { status: 400 })
        }

        // Use a transaction to ensure both wallet and transaction records are updated
        await prisma.$transaction(async (tx: any) => {
            // Update wallet
            await tx.wallet.update({
                where: { userId },
                data: {
                    balance: {
                        increment: changeAmount
                    },
                    ...(changeAmount > 0 && type === 'DEPOSIT' ? {
                        totalDeposit: {
                            increment: changeAmount
                        }
                    } : {})
                }
            })

            // Create transaction record
            await tx.transaction.create({
                data: {
                    transactionId: `ADM${Date.now()}${Math.floor(Math.random() * 1000)}`,
                    userId,
                    type: type as any,
                    amount: Math.abs(changeAmount),
                    balanceAfter: newBalance,
                    description: description || `Cập nhật bởi Admin`,
                    status: 'COMPLETED' as any
                }
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Cập nhật số dư thành công'
        })

    } catch (error) {
        console.error('Wallet update error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

