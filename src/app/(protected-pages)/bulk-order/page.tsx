'use client'

import { useState, useMemo } from 'react'
import { Card, Button, Input, Select, Notification, toast, Skeleton } from '@/components/ui'
import { TbUpload, TbDownload, TbTrash, TbPlus, TbSend, TbInfoCircle, TbLoader2 } from 'react-icons/tb'
import { useServices, useWallet } from '@/hooks/api'
import { useRouter } from 'next/navigation'

type BulkOrderItem = {
    id: string
    serverId: string
    serverName: string
    link: string
    quantity: number
    price: number
    status: 'pending' | 'valid' | 'invalid'
}

const BulkOrderPage = () => {
    const router = useRouter()
    const { services, isLoading: servicesLoading } = useServices({ limit: 1000 })
    const { wallet, mutate: mutateWallet } = useWallet()

    const [orders, setOrders] = useState<BulkOrderItem[]>([])
    const [selectedServerId, setSelectedServerId] = useState('')
    const [bulkText, setBulkText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Flatten all servers from all services for the select options
    const serverOptions = useMemo(() => {
        const options: { value: string, label: string, price: number }[] = []
        services.forEach((s: any) => {
            s.servers?.forEach((server: any) => {
                options.push({
                    value: server.id,
                    label: `[${s.name}] - ${server.name} (${Number(server.price).toLocaleString()}đ/1k)`,
                    price: Number(server.price)
                })
            })
        })
        return options
    }, [services])

    const selectedServer = useMemo(() =>
        serverOptions.find(o => o.value === selectedServerId),
        [serverOptions, selectedServerId])

    const totalPrice = orders.reduce((sum, order) => sum + order.price, 0)
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0)

    const addOrder = () => {
        if (!selectedServerId) {
            toast.push(<Notification title="Lưu ý" type="warning">Vui lòng chọn server trước</Notification>)
            return
        }
        const newOrder: BulkOrderItem = {
            id: Math.random().toString(36).substr(2, 9),
            serverId: selectedServerId,
            serverName: selectedServer?.label || '',
            link: '',
            quantity: 1000,
            price: (1000 / 1000) * (selectedServer?.price || 0),
            status: 'pending'
        }
        setOrders([...orders, newOrder])
    }

    const removeOrder = (id: string) => {
        setOrders(orders.filter(o => o.id !== id))
    }

    const updateOrder = (id: string, field: keyof BulkOrderItem, value: string | number) => {
        setOrders(orders.map(o => {
            if (o.id === id) {
                const updated = { ...o, [field]: value }
                if (field === 'quantity') {
                    updated.price = Math.round((Number(value) / 1000) * (selectedServer?.price || 0))
                }
                if (field === 'link') {
                    updated.status = String(value).trim().length > 5 ? 'valid' : 'invalid'
                }
                return updated
            }
            return o
        }))
    }

    const parseBulkText = () => {
        if (!selectedServerId) {
            toast.push(<Notification title="Lưu ý" type="warning">Vui lòng chọn server trước khi phân tích</Notification>)
            return
        }
        if (!bulkText.trim()) return

        const lines = bulkText.trim().split('\n')
        const newOrders: BulkOrderItem[] = lines.map((line) => {
            const parts = line.split('|').map(p => p.trim())
            const link = parts[0] || ''
            const quantity = parseInt(parts[1]) || 1000

            return {
                id: Math.random().toString(36).substr(2, 9),
                serverId: selectedServerId,
                serverName: selectedServer?.label || '',
                link,
                quantity,
                price: Math.round((quantity / 1000) * (selectedServer?.price || 0)),
                status: link.length > 5 ? 'valid' : 'invalid'
            }
        })

        setOrders([...orders, ...newOrders])
        setBulkText('')
        toast.push(<Notification title="Đã thêm" type="success">Thêm {newOrders.length} dòng</Notification>)
    }

    const submitOrders = async () => {
        const validOrders = orders.filter(o => o.status === 'valid')
        if (validOrders.length === 0) {
            toast.push(<Notification title="Lỗi" type="danger">Không có đơn hàng hợp lệ</Notification>)
            return
        }

        if (Number(wallet?.balance || 0) < totalPrice) {
            toast.push(<Notification title="Lỗi" type="danger">Số dư không đủ</Notification>)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/orders/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: validOrders })
            })
            const result = await res.json()
            if (result.success) {
                toast.push(<Notification title="Thành công" type="success">Đã tạo {result.data.totalCreated} đơn hàng!</Notification>)
                mutateWallet()
                setTimeout(() => router.push('/orders'), 2000)
            } else {
                toast.push(<Notification title="Lỗi" type="danger">{result.error}</Notification>)
            }
        } catch (error) {
            toast.push(<Notification title="Lỗi" type="danger">Đặt hàng thất bại</Notification>)
        } finally {
            setIsSubmitting(false)
        }
    }

    const downloadTemplate = () => {
        const template = `https://facebook.com/link1|1000\nhttps://facebook.com/link2|5000`
        const blob = new Blob([template], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bulk_order_template.txt'
        a.click()
    }

    return (
        <div className="space-y-6 smm-main-content">
            <div className="smm-animate-fadeInUp">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <TbUpload className="text-primary" />
                    Đặt Hàng Hàng Loạt
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Dễ dàng đặt nhiều đơn hàng cùng lúc bằng cách dán danh sách link.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6 smm-animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <Card className="p-4 border-l-4 border-primary">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bước 1: Chọn Server Áp Dụng</label>
                        {servicesLoading ? (
                            <Skeleton className="h-10 w-full rounded-lg" />
                        ) : (
                            <Select
                                placeholder="Tất cả đơn bên dưới sẽ dùng server này..."
                                options={serverOptions}
                                value={serverOptions.find(o => o.value === selectedServerId)}
                                onChange={(option) => {
                                    const val = (option as { value: string })?.value || ''
                                    setSelectedServerId(val)
                                    // Update existing orders server if needed, or clear?
                                }}
                            />
                        )}
                    </Card>

                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Bước 2: Nhập Danh Sách</h3>
                            <Button size="xs" variant="plain" icon={<TbDownload />} onClick={downloadTemplate}>Mẫu .txt</Button>
                        </div>
                        <textarea
                            className="w-full h-32 p-3 border-2 rounded-xl dark:bg-gray-800 dark:border-gray-700 font-mono text-xs focus:border-primary transition-all"
                            placeholder="link|số_lượng (Ví dụ: https://fb.com/123|1000)"
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                        />
                        <div className="flex gap-2 mt-4">
                            <Button variant="solid" onClick={parseBulkText} disabled={!selectedServerId || !bulkText.trim()}>Phân tích danh sách</Button>
                            <Button variant="plain" icon={<TbPlus />} onClick={addOrder}>Thêm dòng</Button>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-bold mb-4">Danh sách ({orders.length})</h3>
                        <div className="overflow-x-auto min-h-[200px]">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b dark:border-gray-800 text-gray-400">
                                        <th className="text-left py-2 px-2">#</th>
                                        <th className="text-left py-2 px-2">Link / UID</th>
                                        <th className="text-left py-2 px-2">Số lượng</th>
                                        <th className="text-left py-2 px-2">Giá</th>
                                        <th className="text-right py-2 px-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={order.id} className="border-b dark:border-gray-800 group">
                                            <td className="py-2 px-2 text-gray-400">{index + 1}</td>
                                            <td className="py-2 px-2">
                                                <input
                                                    className={`w-full bg-transparent border-b outline-none py-1 transition-colors ${order.status === 'invalid' ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                                    value={order.link}
                                                    onChange={(e) => updateOrder(order.id, 'link', e.target.value)}
                                                    placeholder="Dán link tại đây..."
                                                />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="number"
                                                    className="w-20 bg-gray-50 dark:bg-gray-900 border-none rounded px-2 py-1 outline-none font-bold"
                                                    value={order.quantity}
                                                    onChange={(e) => updateOrder(order.id, 'quantity', parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="py-2 px-2 font-black text-primary">{order.price.toLocaleString()}đ</td>
                                            <td className="py-2 px-2 text-right">
                                                <button onClick={() => removeOrder(order.id)} className="text-gray-300 hover:text-red-500 transition-colors"><TbTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan={5} className="py-12 text-center text-gray-400 italic">Dán danh sách vào ô phía trên để bắt đầu</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6 smm-animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <Card className="p-6 bg-primary text-white shadow-xl shadow-primary/20">
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter"><TbSend /> Xác nhận đơn hàng</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center opacity-80"><span className="text-sm">Tổng đơn hàng:</span><span className="font-black">{orders.length}</span></div>
                            <div className="flex justify-between items-center opacity-80"><span className="text-sm">Đơn hợp lệ:</span><span className="font-black">{orders.filter(o => o.status === 'valid').length}</span></div>
                            <div className="h-px bg-white/20 my-2"></div>
                            <div className="flex justify-between items-end"><span className="text-sm font-bold opacity-80 mb-1">Tổng thanh toán:</span><span className="text-2xl font-black">{totalPrice.toLocaleString()}đ</span></div>
                        </div>
                        <Button
                            variant="solid"
                            className="w-full mt-8 bg-white text-primary hover:bg-white/90 border-none font-black py-6 shadow-lg"
                            disabled={orders.length === 0 || isSubmitting}
                            onClick={submitOrders}
                        >
                            {isSubmitting ? <TbLoader2 className="animate-spin" /> : 'THANH TOÁN NGAY'}
                        </Button>
                    </Card>

                    <Card className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2"><TbInfoCircle /> Lưu ý quan trọng</h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-500 space-y-2 list-disc pl-4">
                            <li>Toàn bộ đơn hàng trong danh sách sẽ sử dụng <b>cùng một Server</b> đã chọn ở Bước 1.</li>
                            <li>Định dạng chuẩn: <b>Link | Số lượng</b>. Nếu không nhập số lượng, mặc định sẽ lấy 1000.</li>
                            <li>Hãy đảm bảo số dư trong ví đủ để thanh toán cho toàn bộ danh sách.</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default BulkOrderPage
