import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/announcements - Lấy danh sách thông báo
export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 10,
        })

        return NextResponse.json({
            success: true,
            data: announcements.map((a: { id: string; title: string; content: string; author: string; isPinned: boolean; createdAt: Date }) => ({
                id: a.id,
                title: a.title,
                content: a.content,
                author: a.author,
                isPinned: a.isPinned,
                createdAt: a.createdAt,
            })),
        })
    } catch (error) {
        console.error('Error fetching announcements:', error)
        return NextResponse.json(
            { success: false, error: 'Không thể tải thông báo' },
            { status: 500 }
        )
    }
}
