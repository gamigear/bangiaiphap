'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Badge, Skeleton, toast, Dialog, FormItem, FormContainer, Notification, Select } from '@/components/ui'
import {
    TbPlus,
    TbServer,
    TbCategory,
    TbAdjustmentsHorizontal,
    TbEdit,
    TbTrash,
    TbDotsVertical,
    TbExternalLink,
    TbRefresh,
    TbBrandFacebook,
    TbBrandInstagram,
    TbBrandTiktok,
    TbBrandYoutube,
    TbBrandTelegram,
    TbShoppingCart,
    TbFolder
} from 'react-icons/tb'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
    facebook: <TbBrandFacebook size={20} />,
    instagram: <TbBrandInstagram size={20} />,
    tiktok: <TbBrandTiktok size={20} />,
    youtube: <TbBrandYoutube size={20} />,
    telegram: <TbBrandTelegram size={20} />,
    shopee: <TbShoppingCart size={20} />,
    default: <TbFolder size={20} />
}

const getCategoryIcon = (iconKey: string) => {
    return categoryIcons[iconKey?.toLowerCase()] || categoryIcons.default
}

const AdminServices = () => {
    const { data: response, isLoading, mutate } = useSWR('/api/admin/services', fetcher)
    const { categories = [], services = [], providers = [] } = response?.data || {}

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', icon: '', color: '#3b82f6', order: '0' })

    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<any>(null)
    const [serviceForm, setServiceForm] = useState({ categoryId: '', name: '', slug: '', type: 'LIKE', description: '', order: '0' })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const openCategoryModal = (category: any = null) => {
        setSelectedCategory(category)
        if (category) {
            setCategoryForm({
                name: category.name,
                slug: category.slug,
                icon: category.icon,
                color: category.color,
                order: category.order.toString()
            })
        } else {
            setCategoryForm({ name: '', slug: '', icon: 'default', color: '#3b82f6', order: '0' })
        }
        setIsCategoryModalOpen(true)
    }

    const openServiceModal = (service: any = null) => {
        setSelectedService(service)
        if (service) {
            setServiceForm({
                categoryId: service.categoryId,
                name: service.name,
                slug: service.slug,
                type: service.type,
                description: service.description,
                order: service.order.toString()
            })
        } else {
            setServiceForm({ categoryId: categories[0]?.id || '', name: '', slug: '', type: 'LIKE', description: '', order: '0' })
        }
        setIsServiceModalOpen(true)
    }

    const handleCategorySubmit = async () => {
        setIsSubmitting(true)
        try {
            const url = selectedCategory
                ? `/api/admin/services/categories/${selectedCategory.id}`
                : '/api/admin/services/categories'
            const method = selectedCategory ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryForm)
            })

            const result = await res.json()
            if (result.success) {
                toast.push(<Notification title="Thành công" type="success" />)
                setIsCategoryModalOpen(false)
                mutate()
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleServiceSubmit = async () => {
        setIsSubmitting(true)
        try {
            const url = selectedService
                ? `/api/admin/services/items/${selectedService.id}`
                : '/api/admin/services/items'
            const method = selectedService ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceForm)
            })

            const result = await res.json()
            if (result.success) {
                toast.push(<Notification title="Thành công" type="success" />)
                setIsServiceModalOpen(false)
                mutate()
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Xóa danh mục này?')) return
        const res = await fetch(`/api/admin/services/categories/${id}`, { method: 'DELETE' })
        if ((await res.json()).success) {
            toast.push(<Notification title="Đã xóa" type="success" />)
            mutate()
        }
    }

    const handleDeleteService = async (id: string) => {
        if (!confirm('Xóa dịch vụ này?')) return
        const res = await fetch(`/api/admin/services/items/${id}`, { method: 'DELETE' })
        if ((await res.json()).success) {
            toast.push(<Notification title="Đã xóa" type="success" />)
            mutate()
        }
    }

    return (
        <div className="space-y-6 smm-main-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold heading-text">Dịch Vụ & Máy Chủ</h1>
                    <p className="text-gray-500">Quản lý cấu trúc dịch vụ, giá bán và kết nối nhà cung cấp API.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" icon={<TbRefresh size={18} />} onClick={() => mutate()}>
                        Làm mới
                    </Button>
                    <Button variant="solid" icon={<TbPlus size={18} />} onClick={() => openServiceModal()}>
                        Thêm dịch vụ
                    </Button>
                </div>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-sm bg-blue-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <TbCategory size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-800 uppercase tracking-widest">Danh mục</p>
                            <h3 className="text-2xl font-black">{categories.length}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-purple-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                            <TbAdjustmentsHorizontal size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-purple-800 uppercase tracking-widest">Dịch vụ</p>
                            <h3 className="text-2xl font-black">{services.length}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-green-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                            <TbServer size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-800 uppercase tracking-widest">Nhà cung cấp</p>
                            <h3 className="text-2xl font-black">{providers.length}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Categories Column */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold flex items-center gap-2">
                            <TbCategory className="text-primary" />
                            Danh mục hệ thống
                        </h4>
                        <button className="text-primary text-xs font-bold hover:underline" onClick={() => openCategoryModal()}>+ Thêm mới</button>
                    </div>
                    <div className="space-y-3">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                        ) : (
                            categories.map((cat: any) => (
                                <Card key={cat.id} className="p-4 border-none shadow-sm hover:ring-1 ring-primary/20 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary">
                                                {getCategoryIcon(cat.icon)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{cat.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{cat._count?.services || 0} Dịch vụ</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openCategoryModal(cat)}><TbEdit className="text-gray-400 hover:text-primary" /></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)}><TbTrash className="text-gray-400 hover:text-red-500" /></button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Services Column */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold flex items-center gap-2">
                            <TbAdjustmentsHorizontal className="text-primary" />
                            Danh sách dịch vụ
                        </h4>
                        <div className="flex gap-2">
                            <Input placeholder="Tìm nhanh dịch vụ..." size="sm" className="max-w-[200px]" />
                        </div>
                    </div>

                    <Card className="p-0 border-none shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Tên dịch vụ</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center text-[10px]">Servers</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Giá thấp nhất</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right text-[10px]">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {isLoading ? (
                                        Array(6).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                                                <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-12 mx-auto rounded-lg" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-lg" /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        services.map((service: any) => (
                                            <tr key={service.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group text-xs">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900 dark:text-white">{service.name}</p>
                                                    <p className="text-[10px] text-primary font-black uppercase tracking-tighter">{service.category?.name}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[10px]">
                                                        {service.serverCount}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-green-500">{(service.minPrice || 0).toLocaleString()}đ</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="sm" variant="default" icon={<TbEdit size={16} />} onClick={() => openServiceModal(service)} />
                                                        <Button size="sm" variant="default" icon={<TbTrash size={16} />} className="text-red-500" onClick={() => handleDeleteService(service.id)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Category Modal */}
            <Dialog isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)}>
                <h5 className="mb-4">{selectedCategory ? 'Sửa' : 'Thêm'} Danh mục</h5>
                <FormContainer>
                    <FormItem label="Tên danh mục">
                        <Input value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                    </FormItem>
                    <FormItem label="Slug (Dường dẫn)">
                        <Input value={categoryForm.slug} onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
                    </FormItem>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Icon">
                            <Input value={categoryForm.icon} onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })} />
                        </FormItem>
                        <FormItem label="Màu sắc">
                            <Input type="color" value={categoryForm.color} onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })} />
                        </FormItem>
                    </div>
                    <FormItem label="Thứ tự">
                        <Input type="number" value={categoryForm.order} onChange={e => setCategoryForm({ ...categoryForm, order: e.target.value })} />
                    </FormItem>
                    <div className="text-right mt-6">
                        <Button className="mr-2" onClick={() => setIsCategoryModalOpen(false)}>Hủy</Button>
                        <Button variant="solid" loading={isSubmitting} onClick={handleCategorySubmit}>Lưu</Button>
                    </div>
                </FormContainer>
            </Dialog>

            {/* Service Modal */}
            <Dialog isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)}>
                <h5 className="mb-4">{selectedService ? 'Sửa' : 'Thêm'} Dịch vụ</h5>
                <FormContainer>
                    <FormItem label="Danh mục">
                        <Select value={serviceForm.categoryId} onChange={(e: any) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Select>
                    </FormItem>
                    <FormItem label="Tên dịch vụ">
                        <Input value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                    </FormItem>
                    <FormItem label="Slug">
                        <Input value={serviceForm.slug} onChange={e => setServiceForm({ ...serviceForm, slug: e.target.value })} />
                    </FormItem>
                    <FormItem label="Loại dịch vụ">
                        <Select value={serviceForm.type} onChange={(e: any) => setServiceForm({ ...serviceForm, type: e.target.value })}>
                            <option value="LIKE">LIKE</option>
                            <option value="FOLLOW">FOLLOW</option>
                            <option value="COMMENT">COMMENT</option>
                            <option value="SHARE">SHARE</option>
                            <option value="VIEW">VIEW</option>
                        </Select>
                    </FormItem>
                    <div className="text-right mt-6">
                        <Button className="mr-2" onClick={() => setIsServiceModalOpen(false)}>Hủy</Button>
                        <Button variant="solid" loading={isSubmitting} onClick={handleServiceSubmit}>Lưu</Button>
                    </div>
                </FormContainer>
            </Dialog>
        </div>
    )
}

export default AdminServices

