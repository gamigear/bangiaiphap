const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixIcons() {
    const iconMap = {
        'TbBrandFacebook': '📘',
        'TbBrandInstagram': '📸',
        'TbBrandTiktok': '🎵',
        'TbBrandYoutube': '📺',
        'TbBrandTelegram': '✈️',
        'TbBrandShopee': '🛒',
    }

    const categories = await prisma.serviceCategory.findMany()

    for (const cat of categories) {
        const emoji = iconMap[cat.icon]
        if (emoji) {
            console.log(`Fixing icon: ${cat.name} - ${cat.icon} -> ${emoji}`)
            await prisma.serviceCategory.update({
                where: { id: cat.id },
                data: { icon: emoji }
            })
        }
    }

    console.log('\nDone! Updated icons:')
    const fixed = await prisma.serviceCategory.findMany()
    fixed.forEach(cat => {
        console.log(`${cat.icon} ${cat.name}`)
    })
}

fixIcons()
    .then(() => prisma.$disconnect())
    .catch(console.error)
