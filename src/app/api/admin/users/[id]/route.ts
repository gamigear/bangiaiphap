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

        const { id: userId } = await params
        const body = await request.json()
        const { name, email, tier, isActive } = body

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                tier: tier as any,
                isActive: isActive !== undefined ? isActive : undefined
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Cập nhật người dùng thành công',
            data: user
        })

    } catch (error) {
        console.error('User update error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
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
        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Đã xóa người dùng'
        })
    } catch (error) {
        console.error('User delete error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
