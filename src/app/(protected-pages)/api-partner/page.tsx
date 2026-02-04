'use client'

import { Card, Button, Input } from '@/components/ui'
import { PiCopyDuotone, PiCodeDuotone, PiBookOpenDuotone } from 'react-icons/pi'

export default function ApiPartnerPage() {
    const apiKey = 'btt_demo_xxxxxxxxxxxxxxxxxxxxxx'
    const apiEndpoint = 'https://api.bantuongtac.com/v1'

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        // TODO: Add toast notification
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold heading-text">API & Đối Tác</h1>

            {/* API Key Section */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold heading-text mb-4 flex items-center gap-2">
                    <PiCodeDuotone className="text-primary" />
                    API Key của bạn
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            API Endpoint
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={apiEndpoint}
                                readOnly
                                className="font-mono"
                            />
                            <Button
                                variant="default"
                                icon={<PiCopyDuotone />}
                                onClick={() => copyToClipboard(apiEndpoint)}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            API Key
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={apiKey}
                                readOnly
                                type="password"
                                className="font-mono"
                            />
                            <Button
                                variant="default"
                                icon={<PiCopyDuotone />}
                                onClick={() => copyToClipboard(apiKey)}
                            >
                                Copy
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            ⚠️ Không chia sẻ API Key với bất kỳ ai
                        </p>
                    </div>

                    <Button variant="solid">
                        Tạo API Key mới
                    </Button>
                </div>
            </Card>

            {/* API Documentation */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold heading-text mb-4 flex items-center gap-2">
                    <PiBookOpenDuotone className="text-primary" />
                    Tài liệu API
                </h2>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium mb-2">1. Lấy danh sách dịch vụ</h3>
                        <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                            {`GET /api/v1/services
Header: Authorization: Bearer {API_KEY}`}
                        </pre>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium mb-2">2. Tạo đơn hàng</h3>
                        <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                            {`POST /api/v1/orders
Header: Authorization: Bearer {API_KEY}
Body: {
  "service_id": "string",
  "link": "string",
  "quantity": number
}`}
                        </pre>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium mb-2">3. Kiểm tra trạng thái đơn</h3>
                        <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                            {`GET /api/v1/orders/{order_id}
Header: Authorization: Bearer {API_KEY}`}
                        </pre>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium mb-2">4. Kiểm tra số dư</h3>
                        <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                            {`GET /api/v1/balance
Header: Authorization: Bearer {API_KEY}`}
                        </pre>
                    </div>
                </div>

                <Button variant="default" className="mt-4">
                    Xem tài liệu đầy đủ →
                </Button>
            </Card>

            {/* Reseller Info */}
            <Card className="p-6 bg-primary-subtle border border-primary">
                <h2 className="text-lg font-semibold heading-text mb-2">
                    🤝 Trở thành Đối Tác / Reseller
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Nạp từ 1.000.000 VND trở lên để được nâng cấp tài khoản Reseller
                    với giá ưu đãi hơn và nhiều quyền lợi đặc biệt.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                    <li>Giảm 10-20% cho tất cả dịch vụ</li>
                    <li>Hỗ trợ ưu tiên 24/7</li>
                    <li>API không giới hạn request</li>
                    <li>Dashboard riêng cho reseller</li>
                </ul>
                <Button variant="solid">
                    Liên hệ để trở thành đối tác
                </Button>
            </Card>
        </div>
    )
}
