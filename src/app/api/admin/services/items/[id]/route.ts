import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { categoryId, name, slug, type, description, instructions, order, isActive } = body

        const service = await prisma.service.update({
            where: { id: params.id },
            data: {
                categoryId,
                name,
                slug,
                type,
                description,
                instructions,
                order: order !== undefined ? parseInt(order) : undefined,
                isActive
            }
        })

        return NextResponse.json({ success: true, data: service })
    } catch (error) {
        console.error('Update service error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.service.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true, message: 'Deleted successfully' })
    } catch (error) {
        console.error('Delete service error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
