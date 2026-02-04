'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiSave, HiCog, HiCurrencyDollar, HiMail, HiPhone, HiGlobe } from 'react-icons/hi'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminSettingsPage() {
    const { data: settingsData, mutate } = useSWR('/api/admin/settings', fetcher)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [settings, setSettings] = useState({
        siteName: 'BanTuongTac.com',
        siteDescription: 'Dịch vụ tăng tương tác mạng xã hội uy tín',
        contactEmail: 'support@bantuongtac.com',
        contactPhone: '0123456789',
        telegramSupport: '@bantuongtac_support',

        // Bank Settings
        bankName: 'Vietcombank',
        bankAccountNumber: '1234567890',
        bankAccountName: 'NGUYEN VAN A',
        bankBranch: 'Ho Chi Minh',

        // Deposit Settings
        minDeposit: 10000,
        depositBonus: 0,
        depositBonusMinAmount: 100000,

        // API Settings
        smmApiUrl: '',
        smmApiKey: '',

        // Other
        maintenanceMode: false,
        registrationEnabled: true,
    })

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            const data = await res.json()
            if (data.success) {
                toast.push(<Notification type="success" title="Đã lưu cài đặt" />)
                mutate()
            } else {
                toast.push(<Notification type="danger" title={data.error} />)
            }
        } catch {
            toast.push(<Notification type="danger" title="Có lỗi xảy ra" />)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Cài đặt Hệ thống</h1>
                <Button
                    variant="solid"
                    icon={<HiSave />}
                    loading={isSubmitting}
                    onClick={handleSave}
                >
                    Lưu thay đổi
                </Button>
            </div>

            {/* General Settings */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <HiGlobe className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Thông tin chung</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên website</label>
                        <Input
                            value={settings.siteName}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <Input
                            value={settings.siteDescription}
                            onChange={(e) => handleChange('siteDescription', e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Contact Settings */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <HiMail className="w-5 h-5 text-green-500" />
                    <h2 className="text-lg font-semibold">Thông tin liên hệ</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email hỗ trợ</label>
                        <Input
                            type="email"
                            prefix={<HiMail />}
                            value={settings.contactEmail}
                            onChange={(e) => handleChange('contactEmail', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                        <Input
                            prefix={<HiPhone />}
                            value={settings.contactPhone}
                            onChange={(e) => handleChange('contactPhone', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Telegram</label>
                        <Input
                            value={settings.telegramSupport}
                            onChange={(e) => handleChange('telegramSupport', e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Bank Settings */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <HiCurrencyDollar className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-semibold">Thông tin ngân hàng</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên ngân hàng</label>
                        <Input
                            value={settings.bankName}
                            onChange={(e) => handleChange('bankName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Số tài khoản</label>
                        <Input
                            value={settings.bankAccountNumber}
                            onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên chủ tài khoản</label>
                        <Input
                            value={settings.bankAccountName}
                            onChange={(e) => handleChange('bankAccountName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Chi nhánh</label>
                        <Input
                            value={settings.bankBranch}
                            onChange={(e) => handleChange('bankBranch', e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Deposit Settings */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <HiCurrencyDollar className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-semibold">Cài đặt nạp tiền</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nạp tối thiểu (VNĐ)</label>
                        <Input
                            type="number"
                            value={settings.minDeposit}
                            onChange={(e) => handleChange('minDeposit', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Bonus nạp tiền (%)</label>
                        <Input
                            type="number"
                            value={settings.depositBonus}
                            onChange={(e) => handleChange('depositBonus', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nạp tối thiểu để nhận bonus</label>
                        <Input
                            type="number"
                            value={settings.depositBonusMinAmount}
                            onChange={(e) => handleChange('depositBonusMinAmount', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </Card>

            {/* API Settings */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <HiCog className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold">Cấu hình API (SMM Provider)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">API URL</label>
                        <Input
                            placeholder="https://api.smmprovider.com"
                            value={settings.smmApiUrl}
                            onChange={(e) => handleChange('smmApiUrl', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <Input
                            type="password"
                            placeholder="••••••••••••"
                            value={settings.smmApiKey}
                            onChange={(e) => handleChange('smmApiKey', e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* System Settings */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <HiCog className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-semibold">Cài đặt hệ thống</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="font-medium">Chế độ bảo trì</p>
                            <p className="text-sm text-gray-500">Tạm dừng website để bảo trì</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.maintenanceMode}
                                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="font-medium">Cho phép đăng ký</p>
                            <p className="text-sm text-gray-500">Cho phép người dùng mới tạo tài khoản</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.registrationEnabled}
                                onChange={(e) => handleChange('registrationEnabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            </Card>
        </div>
    )
}
