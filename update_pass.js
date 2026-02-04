const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const email = 'admin@admin.com'
    const password = '123'
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    console.log('Password updated to: 123')
}

main().finally(() => prisma.$disconnect())
