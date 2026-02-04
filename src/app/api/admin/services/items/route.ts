import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { categoryId, name, slug, type, description, instructions, order, isActive } = body

        if (!categoryId || !name || !slug || !type) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const service = await prisma.service.create({
            data: {
                categoryId,
                name,
                slug,
                type,
                description: description || '',
                instructions,
                order: order !== undefined ? parseInt(order) : 0,
                isActive: isActive !== undefined ? isActive : true
            }
        })

        return NextResponse.json({ success: true, data: service })
    } catch (error) {
        console.error('Create service error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
