const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function test() {
    const email = 'admin@admin.com'
    const password = '123'

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log('Stored password hash:', user.password)
    const isMatch = await bcrypt.compare(password, user.password)
    console.log('Password "123" match:', isMatch)
}

test()
    .finally(() => prisma.$disconnect())
