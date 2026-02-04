const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.update({
        where: { email: 'test@example.com' },
        data: { tier: 'ADMIN' }
    })
    console.log('User updated to ADMIN:', user.email)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
