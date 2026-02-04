'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Decimal } from '@prisma/client/runtime/library'
import { revalidatePath } from 'next/cache'
import type { PrismaClient } from '@prisma/client'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

// Response type
interface ActionResponse<T = unknown> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

// Get wallet balance and stats
export async function getWallet(): Promise<ActionResponse<{
    balance: number
    totalDeposit: number
    totalSpent: number
    tier: string
}>> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Vui lòng đăng nhập' }
        }

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
        })

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId: session.user.id,
                    balance: 0,
                    totalDeposit: 0,
                    totalSpent: 0,
                },
            })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { tier: true },
        })

        return {
            success: true,
            data: {
                balance: Number(wallet.balance),
                totalDeposit: Number(wallet.totalDeposit),
                totalSpent: Number(wallet.totalSpent),
                tier: user?.tier || 'MEMBER',
            },
        }
    } catch (error) {
        console.error('Error getting wallet:', error)
        return { success: false, error: 'Không thể tải thông tin ví' }
    }
}

// Create deposit request
export async function createDeposit(formData: {
    amount: number
    paymentMethod: 'BANK_TRANSFER' | 'MOMO' | 'ZALOPAY'
}): Promise<ActionResponse<{
    transactionId: string
    paymentUrl?: string
}>> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Vui lòng đăng nhập' }
        }

        const { amount, paymentMethod } = formData

        // Validate amount
        if (amount < 10000) {
            return { success: false, error: 'Số tiền tối thiểu là 10,000đ' }
        }

        if (amount > 100000000) {
            return { success: false, error: 'Số tiền tối đa là 100,000,000đ' }
        }

        // Get current wallet balance
        const wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
        })

        // Create pending transaction
        const txnCount = await prisma.transaction.count()
        const transactionId = `TXN-${String(txnCount + 1).padStart(6, '0')}`

        await prisma.transaction.create({
            data: {
                transactionId,
                userId: session.user.id,
                type: 'DEPOSIT',
                amount,
                balanceAfter: Number(wallet?.balance || 0) + amount, // Projected balance
                description: `Nạp tiền qua ${paymentMethod}`,
                paymentMethod,
                status: 'PENDING',
                metadata: {
                    requestedAt: new Date().toISOString(),
                },
            },
        })

        // TODO: Generate payment URL based on payment method
        // For now, return transaction ID for manual processing
        let paymentUrl: string | undefined

        // In production, integrate with actual payment gateway
        // Example for bank transfer: return bank details
        // Example for MoMo/ZaloPay: generate QR/redirect URL

        return {
            success: true,
            message: 'Đã tạo yêu cầu nạp tiền',
            data: {
                transactionId,
                paymentUrl,
            },
        }
    } catch (error) {
        console.error('Error creating deposit:', error)
        return { success: false, error: 'Không thể tạo yêu cầu nạp tiền' }
    }
}

// Confirm deposit (called by payment callback or admin)
export async function confirmDeposit(
    transactionId: string,
    confirmedAmount?: number
): Promise<ActionResponse> {
    try {
        // Find pending transaction
        const transaction = await prisma.transaction.findUnique({
            where: { transactionId },
        })

        if (!transaction) {
            return { success: false, error: 'Transaction không tồn tại' }
        }

        if (transaction.status !== 'PENDING') {
            return { success: false, error: 'Transaction đã được xử lý' }
        }

        const amount = confirmedAmount || Number(transaction.amount)

        // Update wallet and transaction
        await prisma.$transaction(async (tx: TransactionClient) => {
            // Get wallet
            const wallet = await tx.wallet.findUnique({
                where: { userId: transaction.userId },
            })

            if (!wallet) {
                throw new Error('Wallet not found')
            }

            // Update wallet balance
            const newBalance = new Decimal(wallet.balance).plus(amount)

            await tx.wallet.update({
                where: { userId: transaction.userId },
                data: {
                    balance: newBalance,
                    totalDeposit: new Decimal(wallet.totalDeposit).plus(amount),
                },
            })

            // Update transaction
            await tx.transaction.update({
                where: { transactionId },
                data: {
                    amount,
                    balanceAfter: newBalance,
                    status: 'COMPLETED',
                },
            })
        })

        revalidatePath('/wallet')
        revalidatePath('/dashboard')

        return { success: true, message: 'Nạp tiền thành công!' }
    } catch (error) {
        console.error('Error confirming deposit:', error)
        return { success: false, error: 'Không thể xác nhận nạp tiền' }
    }
}

// Get transaction history
export async function getTransactions(params?: {
    type?: string
    page?: number
    limit?: number
}): Promise<ActionResponse<{
    items: Array<{
        id: string
        transactionId: string
        type: string
        amount: number
        balanceAfter: number
        description: string
        status: string
        createdAt: Date
    }>
    total: number
    page: number
    totalPages: number
}>> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Vui lòng đăng nhập' }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {
            userId: session.user.id,
        }

        if (params?.type && params.type !== 'all') {
            where.type = params.type.toUpperCase()
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ])

        return {
            success: true,
            data: {
                items: transactions.map(t => ({
                    id: t.id,
                    transactionId: t.transactionId,
                    type: t.type,
                    amount: Number(t.amount),
                    balanceAfter: Number(t.balanceAfter),
                    description: t.description,
                    status: t.status,
                    createdAt: t.createdAt,
                })),
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error('Error getting transactions:', error)
        return { success: false, error: 'Không thể tải lịch sử giao dịch' }
    }
}
