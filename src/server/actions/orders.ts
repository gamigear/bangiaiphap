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

// Create new order
export async function createOrder(formData: {
    serviceId: string
    serverId: string
    link: string
    quantity: number
    note?: string
}): Promise<ActionResponse> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Vui lòng đăng nhập' }
        }

        const { serviceId, serverId, link, quantity, note } = formData

        // Validate input
        if (!link.startsWith('http')) {
            return { success: false, error: 'Link không hợp lệ' }
        }

        // Get service server
        const server = await prisma.serviceServer.findFirst({
            where: {
                id: serverId,
                serviceId,
                isActive: true,
            },
            include: {
                service: true,
            },
        })

        if (!server) {
            return { success: false, error: 'Dịch vụ không tồn tại hoặc đã ngưng hoạt động' }
        }

        // Validate quantity
        if (quantity < server.minQuantity || quantity > server.maxQuantity) {
            return {
                success: false,
                error: `Số lượng phải từ ${server.minQuantity} đến ${server.maxQuantity}`
            }
        }

        // Calculate total price
        const pricePerUnit = new Decimal(server.price).dividedBy(1000)
        const totalPrice = pricePerUnit.times(quantity)

        // Get user wallet
        const wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
        })

        if (!wallet || new Decimal(wallet.balance).lessThan(totalPrice)) {
            return { success: false, error: 'Số dư không đủ để thực hiện giao dịch' }
        }

        // Generate order ID
        const orderCount = await prisma.order.count()
        const orderId = `ORD-${String(orderCount + 1).padStart(6, '0')}`

        // Transaction: Create order + deduct balance
        const order = await prisma.$transaction(async (tx: TransactionClient) => {
            // Deduct from wallet
            const newBalance = new Decimal(wallet.balance).minus(totalPrice)

            await tx.wallet.update({
                where: { userId: session.user.id },
                data: {
                    balance: newBalance,
                    totalSpent: new Decimal(wallet.totalSpent).plus(totalPrice),
                },
            })

            // Create transaction record
            const txnCount = await tx.transaction.count()
            const transactionId = `TXN-${String(txnCount + 1).padStart(6, '0')}`

            await tx.transaction.create({
                data: {
                    transactionId,
                    userId: session.user.id,
                    type: 'ORDER',
                    amount: totalPrice.negated(),
                    balanceAfter: newBalance,
                    description: `Đặt hàng ${server.service.name} x${quantity}`,
                    status: 'COMPLETED',
                },
            })

            // Create order
            return tx.order.create({
                data: {
                    orderId,
                    userId: session.user.id,
                    serviceId,
                    serverId,
                    link,
                    quantity,
                    totalPrice,
                    status: 'PENDING',
                    note,
                },
            })
        })

        // TODO: Send to SMM provider

        revalidatePath('/orders')
        revalidatePath('/dashboard')

        return {
            success: true,
            message: 'Đặt hàng thành công!',
            data: { orderId: order.orderId }
        }
    } catch (error) {
        console.error('Error creating order:', error)
        return { success: false, error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' }
    }
}

// Cancel order
export async function cancelOrder(orderId: string): Promise<ActionResponse> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Vui lòng đăng nhập' }
        }

        const order = await prisma.order.findFirst({
            where: {
                orderId,
                userId: session.user.id,
            },
        })

        if (!order) {
            return { success: false, error: 'Đơn hàng không tồn tại' }
        }

        if (order.status !== 'PENDING') {
            return { success: false, error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' }
        }

        // Refund and cancel
        await prisma.$transaction(async (tx: TransactionClient) => {
            // Get wallet
            const wallet = await tx.wallet.findUnique({
                where: { userId: session.user.id },
            })

            if (!wallet) {
                throw new Error('Wallet not found')
            }

            // Refund
            const newBalance = new Decimal(wallet.balance).plus(order.totalPrice)

            await tx.wallet.update({
                where: { userId: session.user.id },
                data: {
                    balance: newBalance,
                    totalSpent: new Decimal(wallet.totalSpent).minus(order.totalPrice),
                },
            })

            // Create refund transaction
            const txnCount = await tx.transaction.count()
            const transactionId = `TXN-${String(txnCount + 1).padStart(6, '0')}`

            await tx.transaction.create({
                data: {
                    transactionId,
                    userId: session.user.id,
                    type: 'REFUND',
                    amount: order.totalPrice,
                    balanceAfter: newBalance,
                    description: `Hoàn tiền đơn hàng ${orderId}`,
                    status: 'COMPLETED',
                },
            })

            // Update order status
            await tx.order.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' },
            })
        })

        revalidatePath('/orders')
        revalidatePath('/dashboard')

        return { success: true, message: 'Đã hủy đơn hàng và hoàn tiền thành công' }
    } catch (error) {
        console.error('Error canceling order:', error)
        return { success: false, error: 'Không thể hủy đơn hàng' }
    }
}

// Get order stats
export async function getOrderStats(): Promise<ActionResponse<{
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    completedOrders: number
}>> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Vui lòng đăng nhập' }
        }

        const [totalOrders, pendingOrders, processingOrders, completedOrders] = await Promise.all([
            prisma.order.count({ where: { userId: session.user.id } }),
            prisma.order.count({ where: { userId: session.user.id, status: 'PENDING' } }),
            prisma.order.count({
                where: {
                    userId: session.user.id,
                    status: { in: ['PROCESSING', 'IN_PROGRESS'] }
                }
            }),
            prisma.order.count({ where: { userId: session.user.id, status: 'COMPLETED' } }),
        ])

        return {
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                processingOrders,
                completedOrders,
            },
        }
    } catch (error) {
        console.error('Error getting order stats:', error)
        return { success: false, error: 'Không thể tải thống kê' }
    }
}
