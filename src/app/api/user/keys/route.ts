import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'


export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập' }, { status: 401 })
        }

        const keys = await prisma.apiKey.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, data: keys })
    } catch (error) {
        console.error('Fetch API keys error:', error)
        return NextResponse.json({ success: false, error: 'Không thể tải API keys' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập' }, { status: 401 })
        }

        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ success: false, error: 'Vui lòng nhập tên ứng dụng' }, { status: 400 })
        }

        const newKey = await prisma.apiKey.create({
            data: {
                userId: session.user.id,
                name: name,
                key: `btt_${crypto.randomUUID().replace(/-/g, '')}`,
                isActive: true
            }
        })

        return NextResponse.json({ success: true, data: newKey })
    } catch (error) {
        console.error('Create API key error:', error)
        return NextResponse.json({ success: false, error: 'Không thể tạo API key' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID không hợp lệ' }, { status: 400 })
        }

        await prisma.apiKey.delete({
            where: { id: id, userId: session.user.id }
        })

        return NextResponse.json({ success: true, message: 'Đã xóa API key' })
    } catch (error) {
        console.error('Delete API key error:', error)
        return NextResponse.json({ success: false, error: 'Không thể xóa API key' }, { status: 500 })
    }
}
