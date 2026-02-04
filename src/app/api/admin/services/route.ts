import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.authority.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const [categories, services, providers] = await Promise.all([
            prisma.serviceCategory.findMany({
                include: { _count: { select: { services: true } } },
                orderBy: { order: 'asc' }
            }),
            prisma.service.findMany({
                include: {
                    category: true,
                    servers: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.sMMProvider.findMany()
        ])

        return NextResponse.json({
            success: true,
            data: {
                categories,
                services: services.map((s: any) => ({
                    ...s,
                    serverCount: s.servers.length,
                    minPrice: Math.min(...s.servers.map((srv: any) => Number(srv.price)), 0)
                })),
                providers
            }
        })
    } catch (error) {
        console.error('Admin services error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
