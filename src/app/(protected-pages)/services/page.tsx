'use client'

import { useState } from 'react'
import { Input } from '@/components/ui'
import { useCategories, useServices } from '@/hooks/api'
import Link from 'next/link'
import {
    TbBrandFacebook, TbBrandInstagram, TbBrandTiktok, TbBrandYoutube,
    TbBrandTelegram, TbBrandX, TbBrandDiscord, TbBrandThreads,
    TbSearch, TbStar, TbFlame, TbArrowRight, TbSparkles, TbLoader2
} from 'react-icons/tb'
import { SiShopee } from 'react-icons/si'

const platformIcons: Record<string, { icon: React.ReactNode; gradient: string }> = {
    facebook: { icon: <TbBrandFacebook size={28} />, gradient: 'from-blue-500 to-blue-700' },
    instagram: { icon: <TbBrandInstagram size={28} />, gradient: 'from-pink-500 via-red-500 to-yellow-500' },
    tiktok: { icon: <TbBrandTiktok size={28} />, gradient: 'from-black via-pink-500 to-cyan-400' },
    youtube: { icon: <TbBrandYoutube size={28} />, gradient: 'from-red-500 to-red-700' },
    telegram: { icon: <TbBrandTelegram size={28} />, gradient: 'from-sky-400 to-blue-600' },
    twitter: { icon: <TbBrandX size={28} />, gradient: 'from-gray-700 to-black' },
    discord: { icon: <TbBrandDiscord size={28} />, gradient: 'from-indigo-500 to-purple-600' },
    threads: { icon: <TbBrandThreads size={28} />, gradient: 'from-gray-800 to-black' },
    shopee: { icon: <SiShopee size={24} />, gradient: 'from-orange-500 to-red-600' },
}

// Types for API response
interface ServiceServer {
    id: string
    name: string
    price: number
    isRecommended: boolean
}

interface Service {
    id: string
    name: string
    slug: string
    servers: ServiceServer[]
}

interface Category {
    id: string
    name: string
    slug: string
    serviceCount: number
}

interface ServiceWithCategory extends Service {
    category: {
        name: string
        slug: string
    }
}

const ServicesPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    // Fetch data from API
    const { categories, isLoading: categoriesLoading } = useCategories()
    const { services, isLoading: servicesLoading } = useServices({
        categorySlug: activeCategory || undefined,
        search: searchTerm || undefined,
        limit: 100
    })

    const isLoading = categoriesLoading || servicesLoading

    // Group services by category
    const servicesByCategory = (categories as Category[]).map((category: Category) => ({
        ...category,
        services: (services as ServiceWithCategory[]).filter((s: ServiceWithCategory) => s.category.slug === category.slug)
    }))

    const filteredCategories = servicesByCategory.filter(cat => {
        if (activeCategory && cat.slug !== activeCategory) return false
        if (searchTerm) {
            return cat.services.some((s: Service) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return cat.services.length > 0
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="smm-animate-fadeInUp">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <TbSparkles className="text-primary" />
                            Danh sách dịch vụ
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Chọn dịch vụ bạn muốn sử dụng
                        </p>
                    </div>
                    <div className="w-full md:w-80">
                        <Input
                            placeholder="Tìm kiếm dịch vụ..."
                            prefix={<TbSearch className="text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="smm-input"
                        />
                    </div>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="smm-animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        Tất cả
                    </button>
                    {categoriesLoading ? (
                        <div className="flex items-center gap-2 px-4 py-2">
                            <TbLoader2 className="animate-spin" />
                            Đang tải...
                        </div>
                    ) : (
                        (categories as Category[]).map((cat: Category) => {
                            const platformConfig = platformIcons[cat.slug] || { icon: null, gradient: 'from-gray-500 to-gray-700' }
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.slug)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${activeCategory === cat.slug
                                        ? `bg-gradient-to-r ${platformConfig.gradient} text-white shadow-lg`
                                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {platformConfig.icon}
                                    {cat.name}
                                    <span className="text-xs opacity-70">({cat.serviceCount})</span>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <TbLoader2 className="animate-spin text-primary mx-auto" size={32} />
                        <p className="text-gray-500 mt-2">Đang tải dịch vụ...</p>
                    </div>
                </div>
            )}

            {/* Services Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 smm-stagger">
                    {filteredCategories.map((category) => {
                        const platformConfig = platformIcons[category.slug] || { icon: null, gradient: 'from-gray-500 to-gray-700' }

                        return (
                            <div key={category.id} className="smm-service-card">
                                {/* Card Header */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platformConfig.gradient} flex items-center justify-center text-white shadow-lg smm-service-icon`}>
                                        {platformConfig.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{category.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {category.services.length} dịch vụ
                                        </p>
                                    </div>
                                    {category.services.some((s: Service) => s.servers.some((sv: ServiceServer) => sv.isRecommended)) && (
                                        <span className="smm-badge smm-badge-hot ml-auto">
                                            <TbFlame />Hot
                                        </span>
                                    )}
                                </div>

                                {/* Services List */}
                                <div className="space-y-2">
                                    {category.services.slice(0, 4).map((service: Service) => (
                                        <Link
                                            key={service.id}
                                            href={`/services/${category.slug}/${service.slug}`}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-2">
                                                {service.servers.some((s: ServiceServer) => s.isRecommended) && (
                                                    <TbStar className="text-yellow-500 w-4 h-4" />
                                                )}
                                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                    {service.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-primary">
                                                    {service.servers[0]?.price.toLocaleString()}đ
                                                </span>
                                                <TbArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* View All Link */}
                                {category.services.length > 4 && (
                                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                                        <Link
                                            href={`/services?category=${category.slug}`}
                                            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                                        >
                                            Xem thêm {category.services.length - 4} dịch vụ
                                            <TbArrowRight />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredCategories.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <TbSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Không tìm thấy dịch vụ</h3>
                    <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
                </div>
            )}
        </div>
    )
}

export default ServicesPage
