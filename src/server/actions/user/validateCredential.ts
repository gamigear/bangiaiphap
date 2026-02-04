'use server'
import type { SignInCredential } from '@/@types/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const validateCredential = async (values: SignInCredential) => {
    const { email, password } = values
    console.log('Validating credentials for:', email)

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.password) {
            console.log('Login failed: User not found or no password:', email)
            return null
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        console.log('Login verification:', {
            email,
            passwordCorrect: isPasswordCorrect
        })

        if (!isPasswordCorrect) {
            return null
        }

        return {
            id: user.id,
            userName: user.name || user.email.split('@')[0],
            email: user.email,
            avatar: user.avatar || '',
            authority: ['user', user.tier.toLowerCase()],
        }
    } catch (error) {
        console.error('Validate credential error:', error)
        return null
    }
}

export default validateCredential
