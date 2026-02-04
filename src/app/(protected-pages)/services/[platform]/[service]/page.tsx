import { prisma } from '@/lib/prisma'
import { ServiceOrderForm } from '@/components/smm'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{
        platform: string
        service: string
    }>
}

export default async function ServicePage({ params }: PageProps) {
    const { platform, service: serviceSlug } = await params

    // Lấy thông tin dịch vụ từ database
    const service = await prisma.service.findFirst({
        where: {
            slug: serviceSlug,
            category: {
                slug: platform,
                isActive: true
            },
            isActive: true
        },
        include: {
            category: true,
            servers: {
                where: { isActive: true },
                orderBy: { price: 'asc' }
            },
            faqs: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!service) {
        notFound()
    }

    // Map data sang format component mong đợi (Sử dụng serialize để tránh lỗi Decimal)
    const formattedService = {
        ...service,
        servers: service.servers.map((s: any) => ({
            ...s,
            price: Number(s.price)
        }))
    }

    return (
        <div className="space-y-6">
            <div className="smm-animate-fadeInUp">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {formattedService.name}
                    <span className="text-sm font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                        {formattedService.category.name}
                    </span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Hệ thống cung cấp dịch vụ tốt nhất với mức giá tối ưu.
                </p>
            </div>

            <ServiceOrderForm service={formattedService as any} />
        </div>
    )
}
