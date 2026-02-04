'use client'

import { useState } from 'react'
import { Card, Button, Input, Select } from '@/components/ui'

export default function CardDepositPage() {
    const [carrier, setCarrier] = useState({ value: 'viettel', label: 'Viettel' })
    const [denomination, setDenomination] = useState({ value: '100000', label: '100,000 VND' })
    const [cardCode, setCardCode] = useState('')
    const [serialNumber, setSerialNumber] = useState('')

    const carrierOptions = [
        { value: 'viettel', label: 'Viettel' },
        { value: 'vinaphone', label: 'Vinaphone' },
        { value: 'mobifone', label: 'Mobifone' },
    ]

    const denominationOptions = [
        { value: '10000', label: '10,000 VND' },
        { value: '20000', label: '20,000 VND' },
        { value: '50000', label: '50,000 VND' },
        { value: '100000', label: '100,000 VND' },
        { value: '200000', label: '200,000 VND' },
        { value: '500000', label: '500,000 VND' },
    ]

    const handleSubmit = () => {
        // TODO: Implement card deposit
        console.log({ carrier, denomination, cardCode, serialNumber })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="p-6">
                <h2 className="text-xl font-bold heading-text mb-6">Nạp thẻ cào</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nhà mạng
                        </label>
                        <Select
                            options={carrierOptions}
                            value={carrier}
                            onChange={(option) => setCarrier(option as typeof carrier)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mệnh giá
                        </label>
                        <Select
                            options={denominationOptions}
                            value={denomination}
                            onChange={(option) => setDenomination(option as typeof denomination)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mã thẻ
                        </label>
                        <Input
                            value={cardCode}
                            onChange={(e) => setCardCode(e.target.value)}
                            placeholder="Nhập mã thẻ cào"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Số seri
                        </label>
                        <Input
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            placeholder="Nhập số seri"
                        />
                    </div>

                    <div className="bg-warning-subtle border border-warning rounded-lg p-4 text-sm">
                        <p className="font-medium text-warning mb-2">⚠️ Lưu ý:</p>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                            <li>Phí nạp thẻ cào: 20%</li>
                            <li>Thẻ sai mệnh giá sẽ bị trừ 50% giá trị thẻ</li>
                            <li>Không hoàn tiền nếu nhập sai thông tin thẻ</li>
                        </ul>
                    </div>

                    <Button
                        block
                        variant="solid"
                        onClick={handleSubmit}
                        className="mt-4"
                    >
                        Nạp thẻ
                    </Button>
                </div>
            </Card>
        </div>
    )
}
