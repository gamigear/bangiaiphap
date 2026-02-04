import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'

// GET /api/orders - Lấy danh sách đơn hàng của người dùng
export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const where: any = {
            userId: session.user.id
        }

        if (status && status !== 'all') {
            where.status = status as any
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    service: {
                        include: {
                            category: true
                        }
                    },
                    server: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.order.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: orders.map((o: any) => ({
                ...o,
                totalPrice: Number(o.totalPrice)
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Fetch orders error:', error)
        return NextResponse.json(
            { success: false, error: 'Không thể tải danh sách đơn hàng' },
            { status: 500 }
        )
    }
}

// POST /api/orders - Khởi tạo đơn hàng mới
export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng đăng nhập' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { serviceId, serverId, link, quantity, note } = body

        // 1. Phê duyệt input
        if (!serviceId || !serverId || !link || !quantity || quantity <= 0) {
            return NextResponse.json(
                { success: false, error: 'Dữ liệu không hợp lệ' },
                { status: 400 }
            )
        }

        // 2. Lấy thông tin máy chủ và kiểm tra tồn tại
        const server = await prisma.serviceServer.findUnique({
            where: { id: serverId },
            include: { service: true }
        })

        if (!server || !server.isActive) {
            return NextResponse.json(
                { success: false, error: 'Máy chủ không khả dụng' },
                { status: 404 }
            )
        }

        if (quantity < server.minQuantity || quantity > server.maxQuantity) {
            return NextResponse.json(
                { success: false, error: `Số lượng tối thiểu là ${server.minQuantity} và tối đa là ${server.maxQuantity}` },
                { status: 400 }
            )
        }

        // 3. Tính toán giá
        const totalPrice = (Number(server.price) * quantity) / 1000

        // 4. Kiểm tra số dư người dùng
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { wallet: true }
        })

        if (!user || !user.wallet) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy ví người dùng' },
                { status: 404 }
            )
        }

        if (Number(user.wallet.balance) < totalPrice) {
            return NextResponse.json(
                { success: false, error: 'Số dư không đủ. Vui lòng nạp thêm tiền.' },
                { status: 400 }
            )
        }

        // 5. Thực hiện giao dịch nguyên tử (Atomic Transaction)
        const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // A. Trừ tiền từ ví
            const updatedWallet = await tx.wallet.update({
                where: { userId: session.user.id },
                data: {
                    balance: { decrement: totalPrice }
                }
            })

            // B. Tạo bản ghi giao dịch
            const transaction = await tx.transaction.create({
                data: {
                    userId: session.user.id,
                    type: 'ORDER',
                    amount: totalPrice,
                    balanceAfter: updatedWallet.balance,
                    description: `Thanh toán đơn hàng ${orderId}: ${server.service.name}`,
                    transactionId: `TXN-ORD-${Date.now()}`,
                    status: 'COMPLETED'
                }
            })

            // C. Tạo đơn hàng
            const order = await tx.order.create({
                data: {
                    orderId,
                    userId: session.user.id,
                    serviceId,
                    serverId,
                    link,
                    quantity,
                    totalPrice,
                    status: 'PENDING',
                    note: note
                }
            })

            // D. Cập nhật tổng chi tiêu của user
            await tx.wallet.update({
                where: { userId: session.user.id },
                data: {
                    totalSpent: { increment: totalPrice }
                }
            })

            return { order, transaction }
        })

        return NextResponse.json({
            success: true,
            data: result.order,
            message: 'Đặt hàng thành công'
        })

    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json(
            { success: false, error: 'Có lỗi xảy ra khi xử lý đơn hàng' },
            { status: 500 }
        )
    }
}
