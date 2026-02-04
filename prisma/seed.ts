import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Clean existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.luckyWheelSpin.deleteMany()
    await prisma.ticketReply.deleteMany()
    await prisma.ticket.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.order.deleteMany()
    await prisma.apiKey.deleteMany()
    await prisma.serviceFAQ.deleteMany()
    await prisma.serviceServer.deleteMany()
    await prisma.service.deleteMany()
    await prisma.serviceCategory.deleteMany()
    await prisma.wallet.deleteMany()
    await prisma.user.deleteMany()
    await prisma.announcement.deleteMany()
    await prisma.sMMProvider.deleteMany()
    await prisma.luckyWheelConfig.deleteMany()
    await prisma.setting.deleteMany()

    // Create categories
    console.log('📂 Creating categories...')
    const categories = await Promise.all([
        prisma.serviceCategory.create({
            data: {
                name: 'Facebook',
                slug: 'facebook',
                icon: 'TbBrandFacebook',
                color: '#1877F2',
                description: 'Dịch vụ tăng tương tác Facebook',
                order: 1,
            },
        }),
        prisma.serviceCategory.create({
            data: {
                name: 'Instagram',
                slug: 'instagram',
                icon: 'TbBrandInstagram',
                color: '#E4405F',
                description: 'Dịch vụ tăng tương tác Instagram',
                order: 2,
            },
        }),
        prisma.serviceCategory.create({
            data: {
                name: 'TikTok',
                slug: 'tiktok',
                icon: 'TbBrandTiktok',
                color: '#000000',
                description: 'Dịch vụ tăng tương tác TikTok',
                order: 3,
            },
        }),
        prisma.serviceCategory.create({
            data: {
                name: 'YouTube',
                slug: 'youtube',
                icon: 'TbBrandYoutube',
                color: '#FF0000',
                description: 'Dịch vụ tăng tương tác YouTube',
                order: 4,
            },
        }),
        prisma.serviceCategory.create({
            data: {
                name: 'Telegram',
                slug: 'telegram',
                icon: 'TbBrandTelegram',
                color: '#0088CC',
                description: 'Dịch vụ tăng member Telegram',
                order: 5,
            },
        }),
        prisma.serviceCategory.create({
            data: {
                name: 'Shopee',
                slug: 'shopee',
                icon: 'TbBrandShopee',
                color: '#EE4D2D',
                description: 'Dịch vụ tăng tương tác Shopee',
                order: 6,
            },
        }),
    ])

    const [facebook, instagram, tiktok, youtube, telegram, shopee] = categories

    // Create services
    console.log('🛒 Creating services...')

    // Facebook services
    const fbLike = await prisma.service.create({
        data: {
            categoryId: facebook.id,
            name: 'Like Facebook | Việt 🇻🇳',
            slug: 'like-facebook-viet',
            type: 'LIKE',
            description: 'Tăng like bài viết Facebook từ tài khoản Việt Nam thật',
            instructions: `## Hướng dẫn Like Facebook

1. **Bước 1**: Copy link bài viết cần tăng like
2. **Bước 2**: Dán link vào ô "Link"
3. **Bước 3**: Chọn server phù hợp
4. **Bước 4**: Nhập số lượng cần mua
5. **Bước 5**: Nhấn "Đặt Hàng Ngay"

**Lưu ý:**
- Bài viết phải để chế độ công khai
- Không xóa hoặc ẩn bài trong quá trình chạy`,
            order: 1,
            servers: {
                create: [
                    {
                        name: 'Server 1 - Like Việt Cực Nhanh',
                        price: 2990,
                        minQuantity: 50,
                        maxQuantity: 50000,
                        estimatedTime: '1-3 giờ',
                        speed: 'Cực nhanh',
                        quality: 'Việt 100%',
                        isRecommended: true,
                        tags: ['Hot', 'Bảo hành'],
                    },
                    {
                        name: 'Server 2 - Like Việt + Tây Mix',
                        price: 4056,
                        minQuantity: 100,
                        maxQuantity: 100000,
                        estimatedTime: '1-6 giờ',
                        speed: '50K/Day',
                        quality: 'Mix Việt + Tây',
                        tags: ['Bảo hành 15 ngày'],
                    },
                    {
                        name: 'Server 3 - Like Việt Chất Lượng',
                        price: 4141,
                        minQuantity: 100,
                        maxQuantity: 20000,
                        estimatedTime: '1-12 giờ',
                        speed: 'Siêu nhanh',
                        quality: 'Việt 100%',
                        tags: ['Siêu rẻ'],
                    },
                ],
            },
            faqs: {
                create: [
                    {
                        question: 'Những dịch nào được hoàn tiền?',
                        answer: 'Tất cả các dịch vụ đều được hoàn tiền nếu không chạy đủ số lượng cam kết.',
                        order: 1,
                    },
                    {
                        question: 'Tại sao đơn hàng không chạy?',
                        answer: 'Vui lòng kiểm tra link có công khai không, hoặc liên hệ hỗ trợ để được xử lý.',
                        order: 2,
                    },
                ],
            },
        },
    })

    const fbFollow = await prisma.service.create({
        data: {
            categoryId: facebook.id,
            name: 'Follow Facebook | Việt 🇻🇳',
            slug: 'follow-facebook-viet',
            type: 'FOLLOW',
            description: 'Tăng follow trang cá nhân Facebook từ tài khoản Việt Nam',
            order: 2,
            servers: {
                create: [
                    {
                        name: 'Server 1 - Follow Việt Nhanh',
                        price: 3500,
                        minQuantity: 100,
                        maxQuantity: 100000,
                        estimatedTime: '1-6 giờ',
                        speed: 'Nhanh',
                        quality: 'Việt 100%',
                        isRecommended: true,
                        tags: ['Hot'],
                    },
                    {
                        name: 'Server 2 - Follow Tây Siêu Rẻ',
                        price: 1990,
                        minQuantity: 100,
                        maxQuantity: 500000,
                        estimatedTime: '1-24 giờ',
                        speed: '100K/Day',
                        quality: 'Tây',
                        tags: ['Siêu rẻ'],
                    },
                ],
            },
        },
    })

    // Instagram services
    await prisma.service.create({
        data: {
            categoryId: instagram.id,
            name: 'Like Instagram',
            slug: 'like-instagram',
            type: 'LIKE',
            description: 'Tăng like bài viết Instagram',
            order: 1,
            servers: {
                create: [
                    {
                        name: 'Server 1 - Like Real',
                        price: 3500,
                        minQuantity: 50,
                        maxQuantity: 50000,
                        estimatedTime: '0-1 giờ',
                        speed: 'Cực nhanh',
                        quality: 'Real',
                        isRecommended: true,
                    },
                ],
            },
        },
    })

    await prisma.service.create({
        data: {
            categoryId: instagram.id,
            name: 'Follower Instagram',
            slug: 'follower-instagram',
            type: 'FOLLOW',
            description: 'Tăng follower tài khoản Instagram',
            order: 2,
            servers: {
                create: [
                    {
                        name: 'Server 1 - Follower Real',
                        price: 5000,
                        minQuantity: 100,
                        maxQuantity: 100000,
                        estimatedTime: '0-6 giờ',
                        speed: 'Nhanh',
                        quality: 'Real mixed',
                        isRecommended: true,
                    },
                    {
                        name: 'Server 2 - Follower Bot',
                        price: 2500,
                        minQuantity: 100,
                        maxQuantity: 500000,
                        estimatedTime: '0-1 giờ',
                        speed: 'Siêu nhanh',
                        quality: 'Bot',
                        tags: ['Siêu rẻ'],
                    },
                ],
            },
        },
    })

    // TikTok services
    await prisma.service.create({
        data: {
            categoryId: tiktok.id,
            name: 'Like TikTok',
            slug: 'like-tiktok',
            type: 'LIKE',
            description: 'Tăng like video TikTok',
            order: 1,
            servers: {
                create: [
                    {
                        name: 'Server 1 - Like Nhanh',
                        price: 2000,
                        minQuantity: 50,
                        maxQuantity: 100000,
                        estimatedTime: '0-1 giờ',
                        speed: 'Siêu nhanh',
                        quality: 'Mixed',
                        isRecommended: true,
                    },
                ],
            },
        },
    })

    await prisma.service.create({
        data: {
            categoryId: tiktok.id,
            name: 'View TikTok',
            slug: 'view-tiktok',
            type: 'VIEW',
            description: 'Tăng view video TikTok',
            order: 2,
            servers: {
                create: [
                    {
                        name: 'Server 1 - View Siêu Rẻ',
                        price: 500,
                        minQuantity: 1000,
                        maxQuantity: 10000000,
                        estimatedTime: '0-24 giờ',
                        speed: '1M/Day',
                        quality: 'Mixed',
                        isRecommended: true,
                        tags: ['Siêu rẻ'],
                    },
                ],
            },
        },
    })

    // YouTube services
    await prisma.service.create({
        data: {
            categoryId: youtube.id,
            name: 'View YouTube',
            slug: 'view-youtube',
            type: 'VIEW',
            description: 'Tăng view video YouTube',
            order: 1,
            servers: {
                create: [
                    {
                        name: 'Server 1 - View Real',
                        price: 8000,
                        minQuantity: 100,
                        maxQuantity: 100000,
                        estimatedTime: '1-48 giờ',
                        speed: '5K/Day',
                        quality: 'Real',
                        isRecommended: true,
                    },
                ],
            },
        },
    })

    await prisma.service.create({
        data: {
            categoryId: youtube.id,
            name: 'Subscribe YouTube',
            slug: 'subscribe-youtube',
            type: 'SUBSCRIBER',
            description: 'Tăng subscriber kênh YouTube',
            order: 2,
            servers: {
                create: [
                    {
                        name: 'Server 1 - Sub Real',
                        price: 25000,
                        minQuantity: 50,
                        maxQuantity: 10000,
                        estimatedTime: '1-72 giờ',
                        speed: '500/Day',
                        quality: 'Real',
                    },
                ],
            },
        },
    })

    // Create test user
    console.log('👤 Creating test user...')
    const hashedPassword = await bcrypt.hash('123456', 10)
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
            tier: 'MEMBER',
            wallet: {
                create: {
                    balance: 500000,
                    totalDeposit: 1000000,
                    totalSpent: 500000,
                },
            },
        },
    })

    // Create sample transactions
    console.log('💰 Creating sample transactions...')
    await prisma.transaction.createMany({
        data: [
            {
                transactionId: 'TXN-000001',
                userId: user.id,
                type: 'DEPOSIT',
                amount: 500000,
                balanceAfter: 500000,
                description: 'Nạp tiền qua MoMo',
                paymentMethod: 'MOMO',
                status: 'COMPLETED',
            },
            {
                transactionId: 'TXN-000002',
                userId: user.id,
                type: 'DEPOSIT',
                amount: 500000,
                balanceAfter: 1000000,
                description: 'Nạp tiền qua Bank',
                paymentMethod: 'BANK_TRANSFER',
                status: 'COMPLETED',
            },
            {
                transactionId: 'TXN-000003',
                userId: user.id,
                type: 'ORDER',
                amount: -299000,
                balanceAfter: 701000,
                description: 'Đặt hàng Like Facebook x100',
                status: 'COMPLETED',
            },
            {
                transactionId: 'TXN-000004',
                userId: user.id,
                type: 'ORDER',
                amount: -201000,
                balanceAfter: 500000,
                description: 'Đặt hàng Follow TikTok x50',
                status: 'COMPLETED',
            },
        ],
    })

    // Get first service server for orders
    const server = await prisma.serviceServer.findFirst({
        where: { service: { slug: 'like-facebook-viet' } },
    })

    // Create sample orders
    console.log('📦 Creating sample orders...')
    if (server) {
        await prisma.order.createMany({
            data: [
                {
                    orderId: 'ORD-000001',
                    userId: user.id,
                    serviceId: fbLike.id,
                    serverId: server.id,
                    link: 'https://facebook.com/example/post/123',
                    quantity: 1000,
                    totalPrice: 2990,
                    status: 'COMPLETED',
                    startCount: 100,
                    remainQuantity: 0,
                },
                {
                    orderId: 'ORD-000002',
                    userId: user.id,
                    serviceId: fbLike.id,
                    serverId: server.id,
                    link: 'https://facebook.com/example/post/456',
                    quantity: 500,
                    totalPrice: 1495,
                    status: 'IN_PROGRESS',
                    startCount: 50,
                    remainQuantity: 200,
                },
                {
                    orderId: 'ORD-000003',
                    userId: user.id,
                    serviceId: fbLike.id,
                    serverId: server.id,
                    link: 'https://facebook.com/example/post/789',
                    quantity: 2000,
                    totalPrice: 5980,
                    status: 'PENDING',
                },
            ],
        })
    }

    // Create announcements
    console.log('📢 Creating announcements...')
    await prisma.announcement.createMany({
        data: [
            {
                title: '🎉 Chào mừng đến SMM Panel',
                content: 'Chào mừng bạn đến với hệ thống SMM Panel số 1 Việt Nam!',
                author: 'Admin',
                isPinned: true,
            },
            {
                title: '⚠️ Thông báo bảo trì hệ thống',
                content: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai. Xin lỗi vì sự bất tiện.',
                author: 'Admin',
            },
            {
                title: '🔥 Khuyến mãi tháng 2',
                content: 'Nạp 500K+ nhận thêm 10% bonus. Áp dụng đến hết tháng 2/2026.',
                author: 'Admin',
                isPinned: true,
            },
        ],
    })

    // Create lucky wheel config
    console.log('🎰 Creating lucky wheel config...')
    await prisma.luckyWheelConfig.create({
        data: {
            prizes: [
                { label: '1,000 VNĐ', amount: 1000, probability: 30, color: '#FF6B6B' },
                { label: '2,000 VNĐ', amount: 2000, probability: 25, color: '#4ECDC4' },
                { label: '5,000 VNĐ', amount: 5000, probability: 20, color: '#45B7D1' },
                { label: '10,000 VNĐ', amount: 10000, probability: 15, color: '#96CEB4' },
                { label: '20,000 VNĐ', amount: 20000, probability: 7, color: '#FFEAA7' },
                { label: '50,000 VNĐ', amount: 50000, probability: 2.5, color: '#DDA0DD' },
                { label: '100,000 VNĐ', amount: 100000, probability: 0.5, color: '#FFD700' },
            ],
            spinsPerDay: 3,
            spinCost: 5000,
            isActive: true,
        },
    })

    console.log('✅ Seed completed successfully!')
    console.log('')
    console.log('Test user credentials:')
    console.log('  Email: test@example.com')
    console.log('  Password: 123456')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
