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
        const { name, slug, icon, color, description, order } = body

        if (!name || !slug) {
            return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 })
        }

        const category = await prisma.serviceCategory.create({
            data: {
                name,
                slug,
                icon: icon || 'default',
                color: color || '#3b82f6',
                description,
                order: order !== undefined ? parseInt(order) : 0
            }
        })

        return NextResponse.json({ success: true, data: category })
    } catch (error) {
        console.error('Create category error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
