const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateIcons() {
    const iconMap = {
        'Facebook': 'facebook',
        'Instagram': 'instagram',
        'TikTok': 'tiktok',
        'YouTube': 'youtube',
        'Telegram': 'telegram',
        'Shopee': 'shopee',
    }

    const categories = await prisma.serviceCategory.findMany()

    for (const cat of categories) {
        const iconKey = iconMap[cat.name]
        if (iconKey) {
            console.log(`Updating: ${cat.name} -> ${iconKey}`)
            await prisma.serviceCategory.update({
                where: { id: cat.id },
                data: { icon: iconKey }
            })
        }
    }

    console.log('\nDone!')
    const fixed = await prisma.serviceCategory.findMany()
    fixed.forEach(cat => {
        console.log(`${cat.name}: ${cat.icon}`)
    })
}

updateIcons()
    .then(() => prisma.$disconnect())
    .catch(console.error)
