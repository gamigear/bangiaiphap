import { useState, useMemo } from 'react'
import { Card, Button, Input, Select, Skeleton, Notification, toast } from '@/components/ui'
import { useTransactions, useWallet } from '@/hooks/api'
import dayjs from 'dayjs'
import { TbCopy, TbCheck, TbQrcode, TbCash, TbCreditCard } from 'react-icons/tb'

const bankOptions = [
    { value: 'MB', label: 'MB Bank (Quân Đội)', account: '0342616853', name: 'NGUYEN TRUONG GIANG' },
    { value: 'VCB', label: 'Vietcombank', account: '1234567890', name: 'NGUYEN TRUONG GIANG' },
]

export default function DepositPage() {
    const [activeTab, setActiveTab] = useState<'bank' | 'card'>('bank')
    const [selectedBank, setSelectedBank] = useState(bankOptions[0])
    const [amount, setAmount] = useState('100000')
    const [copied, setCopied] = useState<string | null>(null)

    const { transactions, isLoading } = useTransactions({ type: 'DEPOSIT' })
    const { wallet } = useWallet()

    const transferContent = useMemo(() => {
        if (!wallet?.user) return 'BTT'
        const suffix = wallet.user.email.split('@')[0].toUpperCase()
        return `BTT ${suffix}`
    }, [wallet])

    const qrUrl = useMemo(() => {
        return `https://img.vietqr.io/image/${selectedBank.value}-${selectedBank.account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(selectedBank.name)}`
    }, [selectedBank, amount, transferContent])

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text)
        setCopied(key)
        toast.push(<Notification title="Đã sao chép" type="success" />)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="space-y-6 smm-main-content">
            <div className="smm-animate-fadeInUp">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <TbCash className="text-primary" />
                    Nạp Tiền Vào Tài Khoản
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Hệ thống nạp tiền tự động 24/7. Nhận tiền sau 1-5 phút.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 smm-animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <button
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'bank'
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50'
                        }`}
                    onClick={() => setActiveTab('bank')}
                >
                    <TbQrcode size={20} /> Ngân hàng (Ví QR)
                </button>
                <button
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'card'
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50'
                        }`}
                    onClick={() => setActiveTab('card')}
                >
                    <TbCreditCard size={20} /> Thẻ cào (Phí 25%)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Form */}
                <div className="space-y-6 smm-animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    {activeTab === 'bank' ? (
                        <>
                            <Card className="p-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    1. Chọn Ngân Hàng
                                                </label>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {bankOptions.map((bank) => (
                                                        <div
                                                            key={bank.value}
                                                            onClick={() => setSelectedBank(bank)}
                                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedBank.value === bank.value
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-gray-100 dark:border-gray-800'
                                                                }`}
                                                        >
                                                            <p className="font-bold text-sm">{bank.label}</p>
                                                            <p className="text-xs text-gray-500">{bank.account} - {bank.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    2. Nhập Số Tiền (VND)
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="Nhập số tiền..."
                                                    className="smm-input font-bold text-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full md:w-48 flex flex-col items-center">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 w-full">
                                                Quét Mã QR
                                            </label>
                                            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full aspect-square">
                                                <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 text-center italic">
                                                * Dùng ứng dụng Ngân hàng để quét và nạp nhanh
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 border-l-4 border-l-primary">
                                <h3 className="font-bold text-lg mb-4">Thông tin chuyển khoản dự phòng</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <span className="text-sm text-gray-500">Số tài khoản:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-lg font-mono">{selectedBank.account}</span>
                                            <button onClick={() => handleCopy(selectedBank.account, 'acc')} className="text-primary">
                                                {copied === 'acc' ? <TbCheck /> : <TbCopy />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <span className="text-sm text-gray-500">Nội dung chuyển:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-lg text-red-500 font-mono">{transferContent}</span>
                                            <button onClick={() => handleCopy(transferContent, 'content')} className="text-primary">
                                                {copied === 'content' ? <TbCheck /> : <TbCopy />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <Card className="p-6">
                            <div className="space-y-4">
                                <p className="text-center py-8 text-gray-500 italic">Tính năng nạp thẻ cào đang được bảo trì. Vui lòng sử dụng nạp tiền qua Ngân hàng.</p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right - Transaction History */}
                <div className="space-y-6 smm-animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-black text-lg uppercase tracking-tight">Lịch sử nạp tiền</h4>
                            <span className="text-xs text-gray-400">5 giao dịch gần nhất</span>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.slice(0, 5).map((txn: any) => (
                                    <div
                                        key={txn.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <TbCash size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-mono">{txn.transactionId}</p>
                                                <p className="text-[10px] text-gray-500">{dayjs(txn.createdAt).fromNow()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-green-500 text-sm">+{Number(txn.amount).toLocaleString('vi-VN')}đ</p>
                                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase font-bold">Thành công</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <TbCash className="mx-auto text-4xl mb-2 opacity-20" />
                                    <p className="text-sm">Chưa có giao dịch nạp tiền</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                        <h5 className="font-bold text-blue-600 dark:text-blue-400 mb-2">💡 Mẹo nhỏ:</h5>
                        <ul className="text-xs text-blue-700 dark:text-blue-500 space-y-2 list-disc pl-4">
                            <li>Hệ thống <b>cộng tiền tự động</b> nếu bạn chuyển đúng nội dung.</li>
                            <li>Nếu sau 15 phút chưa nhận được tiền, hãy chụp màn hình bill và gửi cho Admin ở phần <b>Hỗ trợ</b>.</li>
                            <li>Tỉ lệ nạp thẻ cào thường bị chiết khấu cao (25-30%), khuyên bạn nên nạp qua Ngân hàng để nhận 100% số tiền.</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    )
}

