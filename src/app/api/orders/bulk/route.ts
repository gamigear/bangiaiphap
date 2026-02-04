import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'


export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập' }, { status: 401 })
        }

        const body = await request.json()
        const { orders } = body

        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            return NextResponse.json({ success: false, error: 'Danh sách đơn hàng không hợp lệ' }, { status: 400 })
        }

        const results = []
        let totalCost = 0

        // Phase 1: Validation and Cost Calculation
        for (const order of orders) {
            const { serverId, quantity, link } = order

            const server = await prisma.serviceServer.findUnique({
                where: { id: serverId, isActive: true },
                include: { service: true }
            })

            if (!server) {
                results.push({ order, error: 'Dịch vụ không tồn tại hoặc đã bị tắt' })
                continue
            }

            if (quantity < server.minQuantity || quantity > server.maxQuantity) {
                results.push({ order, error: `Số lượng phải từ ${server.minQuantity} đến ${server.maxQuantity}` })
                continue
            }

            const cost = Math.round((quantity / 1000) * Number(server.price))
            totalCost += cost
            order.cost = cost
            order.server = server
        }

        // Phase 2: Balance Check
        const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } })
        if (!wallet || Number(wallet.balance) < totalCost) {
            return NextResponse.json({ success: false, error: 'Số dư không đủ để thực hiện toàn bộ đơn hàng' }, { status: 400 })
        }

        // Phase 3: Order Creation (Sequential for simplicity and safety)
        const createdOrders: any[] = []

        await prisma.$transaction(async (tx: any) => {
            // Deduct total cost
            await tx.wallet.update({
                where: { userId: session.user.id },
                data: {
                    balance: { decrement: totalCost },
                    totalSpent: { increment: totalCost }
                }
            })

            for (const order of orders) {
                if (order.error) continue

                const newOrder = await tx.order.create({
                    data: {
                        orderId: `BTT${Date.now()}${Math.floor(Math.random() * 1000)}`,
                        userId: session.user.id,
                        serviceId: order.server.serviceId,
                        serverId: order.server.id,
                        link: order.link,
                        quantity: order.quantity,
                        totalPrice: order.cost,
                        status: 'PENDING',
                        note: order.note || 'Bulk Order'
                    }
                })

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        transactionId: `TXN${newOrder.orderId}`,
                        userId: session.user.id,
                        type: 'ORDER',
                        amount: order.cost,
                        balanceAfter: Number(wallet.balance) - totalCost, // This is a bit simplified, ideally calculated per step
                        description: `Thanh toán đơn hàng ${newOrder.orderId}`,
                        status: 'COMPLETED'
                    }
                })

                createdOrders.push(newOrder)
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                totalCreated: createdOrders.length,
                totalCost,
                orders: createdOrders
            }
        })

    } catch (error) {
        console.error('Bulk order error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra khi xử lý đơn hàng hàng loạt' }, { status: 500 })
    }
}
