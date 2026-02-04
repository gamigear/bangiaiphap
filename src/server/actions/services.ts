'use server'

import { prisma } from '@/lib/prisma'

// Response type
interface ActionResponse<T = unknown> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

// Get all active categories with service counts
export async function getCategories(): Promise<ActionResponse<Array<{
    id: string
    name: string
    slug: string
    icon: string
    color: string
    description: string | null
    serviceCount: number
}>>> {
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

        return {
            success: true,
            data: categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color,
                description: cat.description,
                serviceCount: cat._count.services,
            })),
        }
    } catch (error) {
        console.error('Error getting categories:', error)
        return { success: false, error: 'Không thể tải danh mục' }
    }
}

// Get services by category
export async function getServices(params?: {
    categorySlug?: string
    search?: string
    page?: number
    limit?: number
}): Promise<ActionResponse<{
    items: Array<{
        id: string
        name: string
        slug: string
        type: string
        description: string
        category: {
            name: string
            slug: string
            icon: string
            color: string
        }
        servers: Array<{
            id: string
            name: string
            price: number
            minQuantity: number
            maxQuantity: number
            estimatedTime: string
            speed: string
            quality: string
            tags: string[]
            isRecommended: boolean
        }>
    }>
    total: number
    page: number
    totalPages: number
}>> {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {
            isActive: true,
        }

        if (params?.categorySlug) {
            where.category = { slug: params.categorySlug }
        }

        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                include: {
                    category: {
                        select: {
                            name: true,
                            slug: true,
                            icon: true,
                            color: true,
                        },
                    },
                    servers: {
                        where: { isActive: true },
                        orderBy: [
                            { isRecommended: 'desc' },
                            { price: 'asc' },
                        ],
                    },
                },
                orderBy: [
                    { order: 'asc' },
                ],
                skip,
                take: limit,
            }),
            prisma.service.count({ where }),
        ])

        return {
            success: true,
            data: {
                items: services.map(s => ({
                    id: s.id,
                    name: s.name,
                    slug: s.slug,
                    type: s.type,
                    description: s.description,
                    category: s.category,
                    servers: s.servers.map(srv => ({
                        id: srv.id,
                        name: srv.name,
                        price: Number(srv.price),
                        minQuantity: srv.minQuantity,
                        maxQuantity: srv.maxQuantity,
                        estimatedTime: srv.estimatedTime,
                        speed: srv.speed,
                        quality: srv.quality,
                        tags: srv.tags,
                        isRecommended: srv.isRecommended,
                    })),
                })),
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error('Error getting services:', error)
        return { success: false, error: 'Không thể tải danh sách dịch vụ' }
    }
}

// Get single service by slug
export async function getServiceBySlug(slug: string): Promise<ActionResponse<{
    id: string
    name: string
    slug: string
    type: string
    description: string
    instructions: string | null
    category: {
        name: string
        slug: string
        icon: string
        color: string
    }
    servers: Array<{
        id: string
        name: string
        price: number
        minQuantity: number
        maxQuantity: number
        estimatedTime: string
        speed: string
        quality: string
        tags: string[]
        isRecommended: boolean
    }>
    faqs: Array<{
        question: string
        answer: string
    }>
}>> {
    try {
        const service = await prisma.service.findUnique({
            where: { slug },
            include: {
                category: {
                    select: {
                        name: true,
                        slug: true,
                        icon: true,
                        color: true,
                    },
                },
                servers: {
                    where: { isActive: true },
                    orderBy: [
                        { isRecommended: 'desc' },
                        { price: 'asc' },
                    ],
                },
                faqs: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!service) {
            return { success: false, error: 'Dịch vụ không tồn tại' }
        }

        return {
            success: true,
            data: {
                id: service.id,
                name: service.name,
                slug: service.slug,
                type: service.type,
                description: service.description,
                instructions: service.instructions,
                category: service.category,
                servers: service.servers.map(srv => ({
                    id: srv.id,
                    name: srv.name,
                    price: Number(srv.price),
                    minQuantity: srv.minQuantity,
                    maxQuantity: srv.maxQuantity,
                    estimatedTime: srv.estimatedTime,
                    speed: srv.speed,
                    quality: srv.quality,
                    tags: srv.tags,
                    isRecommended: srv.isRecommended,
                })),
                faqs: service.faqs.map(faq => ({
                    question: faq.question,
                    answer: faq.answer,
                })),
            },
        }
    } catch (error) {
        console.error('Error getting service:', error)
        return { success: false, error: 'Không thể tải thông tin dịch vụ' }
    }
}
