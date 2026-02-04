const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...\n')

    // ==================== SETTINGS ====================
    console.log('📝 Creating settings...')
    const settings = [
        { key: 'siteName', value: 'BanTuongTac.com' },
        { key: 'siteDescription', value: 'Dịch vụ tăng tương tác mạng xã hội uy tín' },
        { key: 'contactEmail', value: 'support@bantuongtac.com' },
        { key: 'contactPhone', value: '0123456789' },
        { key: 'telegramSupport', value: '@bantuongtac_support' },
        { key: 'bankName', value: 'Vietcombank' },
        { key: 'bankAccountNumber', value: '1234567890' },
        { key: 'bankAccountName', value: 'NGUYEN VAN A' },
        { key: 'bankBranch', value: 'Ho Chi Minh' },
        { key: 'minDeposit', value: 10000 },
        { key: 'depositBonus', value: 0 },
        { key: 'depositBonusMinAmount', value: 100000 },
        { key: 'maintenanceMode', value: false },
        { key: 'registrationEnabled', value: true },
    ]

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting
        })
    }
    console.log(`✅ Created ${settings.length} settings\n`)

    // ==================== ADMIN USER ====================
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: { password: hashedPassword, tier: 'ADMIN' },
        create: {
            email: 'admin@admin.com',
            name: 'Administrator',
            password: hashedPassword,
            tier: 'ADMIN',
            wallet: {
                create: {
                    balance: 0,
                    totalDeposit: 0,
                    totalSpent: 0
                }
            }
        }
    })
    console.log('✅ Admin user ready (admin@admin.com / admin123)\n')

    // ==================== CATEGORIES ====================
    console.log('📁 Creating service categories...')
    const categories = [
        { name: 'Facebook', slug: 'facebook', icon: 'facebook', color: '#1877F2', order: 1 },
        { name: 'Instagram', slug: 'instagram', icon: 'instagram', color: '#E4405F', order: 2 },
        { name: 'TikTok', slug: 'tiktok', icon: 'tiktok', color: '#000000', order: 3 },
        { name: 'YouTube', slug: 'youtube', icon: 'youtube', color: '#FF0000', order: 4 },
        { name: 'Telegram', slug: 'telegram', icon: 'telegram', color: '#0088CC', order: 5 },
        { name: 'Shopee', slug: 'shopee', icon: 'shopee', color: '#EE4D2D', order: 6 },
    ]

    for (const cat of categories) {
        await prisma.serviceCategory.upsert({
            where: { slug: cat.slug },
            update: cat,
            create: cat
        })
    }
    console.log(`✅ Created ${categories.length} categories\n`)

    // ==================== SERVICES & SERVERS ====================
    console.log('🛠️ Creating services and servers...')
    const serviceData = [
        {
            category: 'facebook',
            services: [
                {
                    name: 'Like Facebook', slug: 'like-facebook', type: 'LIKE', servers: [
                        { name: 'Server 1 - Việt', price: 15, min: 100, max: 50000, time: '1-6h', speed: 'Nhanh' },
                        { name: 'Server 2 - Mix', price: 10, min: 100, max: 100000, time: '1-24h', speed: 'Trung bình' },
                    ]
                },
                {
                    name: 'Follow Facebook', slug: 'follow-facebook', type: 'FOLLOW', servers: [
                        { name: 'Server VN', price: 20, min: 100, max: 50000, time: '1-12h', speed: 'Nhanh' },
                    ]
                },
                {
                    name: 'Share Facebook', slug: 'share-facebook', type: 'SHARE', servers: [
                        { name: 'Server 1', price: 25, min: 50, max: 10000, time: '1-6h', speed: 'Nhanh' },
                    ]
                },
            ]
        },
        {
            category: 'instagram',
            services: [
                {
                    name: 'Like Instagram', slug: 'like-instagram', type: 'LIKE', servers: [
                        { name: 'Server Real', price: 12, min: 100, max: 50000, time: '0-1h', speed: 'Nhanh' },
                    ]
                },
                {
                    name: 'Follower Instagram', slug: 'follower-instagram', type: 'FOLLOW', servers: [
                        { name: 'Server VN', price: 25, min: 100, max: 100000, time: '1-24h', speed: 'Trung bình' },
                        { name: 'Server Real', price: 45, min: 50, max: 50000, time: '1-48h', speed: 'Chậm' },
                    ]
                },
            ]
        },
        {
            category: 'tiktok',
            services: [
                {
                    name: 'Like TikTok', slug: 'like-tiktok', type: 'LIKE', servers: [
                        { name: 'Server 1', price: 8, min: 100, max: 100000, time: '0-1h', speed: 'Siêu nhanh' },
                    ]
                },
                {
                    name: 'View TikTok', slug: 'view-tiktok', type: 'VIEW', servers: [
                        { name: 'Server View', price: 2, min: 1000, max: 1000000, time: '0-1h', speed: 'Siêu nhanh' },
                    ]
                },
                {
                    name: 'Follower TikTok', slug: 'follower-tiktok', type: 'FOLLOW', servers: [
                        { name: 'Server VN', price: 30, min: 100, max: 50000, time: '1-12h', speed: 'Nhanh' },
                    ]
                },
            ]
        },
        {
            category: 'youtube',
            services: [
                {
                    name: 'Subscribe YouTube', slug: 'subscribe-youtube', type: 'SUBSCRIBER', servers: [
                        { name: 'Server Real', price: 100, min: 100, max: 10000, time: '1-7 ngày', speed: 'Chậm' },
                    ]
                },
                {
                    name: 'View YouTube', slug: 'view-youtube', type: 'VIEW', servers: [
                        { name: 'Server 1', price: 5, min: 1000, max: 500000, time: '0-24h', speed: 'Nhanh' },
                    ]
                },
                {
                    name: 'Like YouTube', slug: 'like-youtube', type: 'LIKE', servers: [
                        { name: 'Server 1', price: 20, min: 100, max: 50000, time: '1-24h', speed: 'Trung bình' },
                    ]
                },
            ]
        },
        {
            category: 'telegram',
            services: [
                {
                    name: 'Member Telegram Group', slug: 'member-telegram-group', type: 'FOLLOW', servers: [
                        { name: 'Server Real', price: 50, min: 100, max: 50000, time: '1-24h', speed: 'Trung bình' },
                    ]
                },
                {
                    name: 'View Telegram', slug: 'view-telegram', type: 'VIEW', servers: [
                        { name: 'Server 1', price: 3, min: 1000, max: 100000, time: '0-1h', speed: 'Siêu nhanh' },
                    ]
                },
            ]
        },
        {
            category: 'shopee',
            services: [
                {
                    name: 'Follow Shopee', slug: 'follow-shopee', type: 'FOLLOW', servers: [
                        { name: 'Server VN', price: 30, min: 100, max: 10000, time: '1-24h', speed: 'Nhanh' },
                    ]
                },
                {
                    name: 'Tim Shopee', slug: 'tim-shopee', type: 'LIKE', servers: [
                        { name: 'Server 1', price: 15, min: 100, max: 50000, time: '1-12h', speed: 'Nhanh' },
                    ]
                },
            ]
        },
    ]

    for (const catData of serviceData) {
        const category = await prisma.serviceCategory.findUnique({ where: { slug: catData.category } })
        if (!category) continue

        for (const svc of catData.services) {
            const service = await prisma.service.upsert({
                where: { slug: svc.slug },
                update: {
                    name: svc.name,
                    type: svc.type,
                    description: `Dịch vụ ${svc.name} chất lượng cao, giá rẻ nhất thị trường.`,
                },
                create: {
                    categoryId: category.id,
                    name: svc.name,
                    slug: svc.slug,
                    type: svc.type,
                    description: `Dịch vụ ${svc.name} chất lượng cao, giá rẻ nhất thị trường.`,
                }
            })

            // Create servers
            for (let i = 0; i < svc.servers.length; i++) {
                const srv = svc.servers[i]
                await prisma.serviceServer.upsert({
                    where: { id: `${service.id}-server-${i}` },
                    update: {
                        name: srv.name,
                        price: srv.price,
                        minQuantity: srv.min,
                        maxQuantity: srv.max,
                        estimatedTime: srv.time,
                        speed: srv.speed,
                        quality: 'Cao',
                        isRecommended: i === 0,
                    },
                    create: {
                        id: `${service.id}-server-${i}`,
                        serviceId: service.id,
                        name: srv.name,
                        price: srv.price,
                        minQuantity: srv.min,
                        maxQuantity: srv.max,
                        estimatedTime: srv.time,
                        speed: srv.speed,
                        quality: 'Cao',
                        isRecommended: i === 0,
                    }
                })
            }
        }
    }
    console.log('✅ Created services and servers\n')

    // ==================== ANNOUNCEMENTS ====================
    console.log('📢 Creating announcements...')
    await prisma.announcement.upsert({
        where: { id: 'welcome-announcement' },
        update: {},
        create: {
            id: 'welcome-announcement',
            title: 'Chào mừng đến với BanTuongTac.com!',
            content: 'Hệ thống tăng tương tác mạng xã hội uy tín hàng đầu Việt Nam. Đăng ký ngay để nhận ưu đãi!',
            author: 'Admin',
            isPinned: true
        }
    })
    console.log('✅ Created announcements\n')

    // ==================== LUCKY WHEEL CONFIG ====================
    console.log('🎰 Creating lucky wheel config...')
    await prisma.luckyWheelConfig.upsert({
        where: { id: 'default-config' },
        update: {},
        create: {
            id: 'default-config',
            prizes: [
                { label: 'Mất lượt', value: 0, probability: 30, color: '#6B7280' },
                { label: '1,000đ', value: 1000, probability: 25, color: '#10B981' },
                { label: '2,000đ', value: 2000, probability: 20, color: '#3B82F6' },
                { label: '5,000đ', value: 5000, probability: 15, color: '#8B5CF6' },
                { label: '10,000đ', value: 10000, probability: 8, color: '#F59E0B' },
                { label: '50,000đ', value: 50000, probability: 2, color: '#EF4444' },
            ],
            spinsPerDay: 3,
            spinCost: 0,
            isActive: true
        }
    })
    console.log('✅ Created lucky wheel config\n')

    console.log('🎉 Database seeding completed!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
