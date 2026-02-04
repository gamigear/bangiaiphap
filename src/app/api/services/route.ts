import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/services - Lấy danh sách services
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const categorySlug = searchParams.get('category')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: Record<string, unknown> = {
            isActive: true,
        }

        if (categorySlug) {
            where.category = { slug: categorySlug }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Get services with category and servers
        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            icon: true,
                            color: true,
                        },
                    },
                    servers: {
                        where: { isActive: true },
                        orderBy: { isRecommended: 'desc' },
                    },
                    faqs: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: [
                    { category: { order: 'asc' } },
                    { order: 'asc' },
                ],
                skip,
                take: limit,
            }),
            prisma.service.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                items: services,
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching services:', error)
        return NextResponse.json(
            { success: false, error: 'Không thể tải danh sách dịch vụ' },
            { status: 500 }
        )
    }
}
