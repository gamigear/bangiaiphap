import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/services/categories - Lấy danh sách categories
export async function GET() {
    try {
        const categories = await prisma.serviceCategory.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: {
                        services: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: categories.map((cat: { _count: { services: number };[key: string]: unknown }) => ({
                ...cat,
                serviceCount: cat._count.services,
                _count: undefined,
            })),
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { success: false, error: 'Không thể tải danh mục' },
            { status: 500 }
        )
    }
}
