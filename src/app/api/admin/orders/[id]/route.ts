import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {

    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const orderId = params.id
        const body = await request.json()
        const { status, refundAmount, startCount, remainQuantity } = body

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: { include: { wallet: true } } }
        })

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
        }

        const updateData: any = {}
        if (status) updateData.status = status
        if (startCount !== undefined) updateData.startCount = parseInt(startCount)
        if (remainQuantity !== undefined) updateData.remainQuantity = parseInt(remainQuantity)

        // Handle refund if needed
        if (refundAmount && Number(refundAmount) > 0) {
            const amount = Number(refundAmount)

            if (!order.user.wallet) {
                return NextResponse.json({ success: false, error: 'User wallet not found' }, { status: 404 })
            }

            await prisma.$transaction(async (tx: any) => {
                // Update order
                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        ...updateData,
                        status: status || 'REFUNDED'
                    }
                })

                // Refund to wallet
                const newBalance = Number(order.user.wallet.balance) + amount
                await tx.wallet.update({
                    where: { userId: order.userId },
                    data: {
                        balance: { increment: amount },
                        totalSpent: { decrement: amount }
                    }
                })

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        transactionId: `REF${Date.now()}${Math.floor(Math.random() * 1000)}`,
                        userId: order.userId,
                        type: 'REFUND' as any,
                        amount: amount,
                        balanceAfter: newBalance,
                        description: `Hoàn tiền đơn hàng ${order.orderId}`,
                        status: 'COMPLETED' as any
                    }
                })
            })
        } else {
            // Just update order status/metadata
            await prisma.order.update({
                where: { id: orderId },
                data: updateData
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Cập nhật đơn hàng thành công'
        })

    } catch (error) {
        console.error('Order update error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Delete order (be careful with this in production!)
        await prisma.order.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true,
            message: 'Đã xóa đơn hàng'
        })
    } catch (error) {
        console.error('Order delete error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
