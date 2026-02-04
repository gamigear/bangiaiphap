const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAndFix() {
    console.log('Checking categories...')
    const categories = await prisma.serviceCategory.findMany()

    console.log('Current categories:')
    categories.forEach(cat => {
        console.log(`- ID: ${cat.id}`)
        console.log(`  Name: ${cat.name}`)
        console.log(`  Icon: ${cat.icon}`)
        console.log(`  Slug: ${cat.slug}`)
        console.log('')
    })

    // The issue: icon is being stored in name field
    // Fix: Update categories with proper names
    const fixMap = {
        'TbBrandFacebook': { name: 'Facebook', icon: '📘' },
        'TbBrandInstagram': { name: 'Instagram', icon: '📸' },
        'TbBrandTiktok': { name: 'TikTok', icon: '🎵' },
        'TbBrandYoutube': { name: 'Youtube', icon: '📺' },
        'TbBrandTelegram': { name: 'Telegram', icon: '✈️' },
        'TbBrandShopee': { name: 'Shopee', icon: '🛒' },
    }

    for (const cat of categories) {
        const fix = fixMap[cat.name]
        if (fix) {
            console.log(`Fixing: ${cat.name} -> ${fix.name}`)
            await prisma.serviceCategory.update({
                where: { id: cat.id },
                data: { name: fix.name, icon: fix.icon }
            })
        }
    }

    console.log('\nFixed categories:')
    const fixed = await prisma.serviceCategory.findMany()
    fixed.forEach(cat => {
        console.log(`- ${cat.name} (${cat.icon})`)
    })
}

checkAndFix()
    .then(() => prisma.$disconnect())
    .catch(console.error)
