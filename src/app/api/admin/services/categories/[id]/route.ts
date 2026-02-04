import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, slug, icon, color, description, order, isActive } = body

        const category = await prisma.serviceCategory.update({
            where: { id },
            data: {
                name,
                slug,
                icon,
                color,
                description,
                order: order !== undefined ? parseInt(order) : undefined,
                isActive
            }
        })

        return NextResponse.json({ success: true, data: category })
    } catch (error) {
        console.error('Update category error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        await prisma.serviceCategory.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: 'Deleted successfully' })
    } catch (error) {
        console.error('Delete category error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
