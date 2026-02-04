const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const email = 'admin@admin.com'
    const password = 'Matkhau@2023'
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            tier: 'ADMIN',
            isActive: true
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Super Admin',
            tier: 'ADMIN',
            isActive: true,
            wallet: {
                create: {
                    balance: 0,
                    totalDeposit: 0,
                    totalSpent: 0
                }
            }
        }
    })

    console.log('Admin account created/updated successfully:')
    console.log('Email:', admin.email)
    console.log('Role:', admin.tier)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
