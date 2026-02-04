'use client'

import { useState, useRef, useEffect } from 'react'
import { Notification, toast, Skeleton } from '@/components/ui'
import { TbGift, TbHistory, TbTrophy, TbInfoCircle, TbSparkles, TbCoin } from 'react-icons/tb'
import { useLuckyWheel, useLuckyWheelHistory, useWallet } from '@/hooks/api'
import dayjs from 'dayjs'

interface Prize {
    label: string
    amount: number
    probability: number
    color: string
}

const LuckyWheelPage = () => {
    const { config, isLoading: configLoading, mutate: mutateConfig } = useLuckyWheel()
    const { history, isLoading: historyLoading, mutate: mutateHistory } = useLuckyWheelHistory()
    const { mutate: mutateWallet } = useWallet()

    const [isSpinning, setIsSpinning] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [result, setResult] = useState<string | null>(null)
    const [spinsRemaining, setSpinsRemaining] = useState(0)
    const wheelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (config) {
            setSpinsRemaining(config.spinsRemaining)
        }
    }, [config])

    const prizes: Prize[] = config?.prizes || []

    const spinWheel = async () => {
        if (isSpinning || spinsRemaining <= 0 || prizes.length === 0) return

        setIsSpinning(true)
        setResult(null)

        try {
            const res = await fetch('/api/lucky-wheel/spin', { method: 'POST' })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra khi quay')
            }

            const wonPrize = data.data.prize

            // Tìm index của giải thưởng để quay đến đúng vị trí
            const prizeIndex = prizes.findIndex(p => p.label === wonPrize)
            const segmentAngle = 360 / prizes.length
            // Quay đến giữa segment. SVG 0 độ là 3h, nhưng code hiện tại đang tính từ 12h?
            // Kiểm tra SVG logic bên dưới: (angle - 90) * (Math.PI / 180) => -90 is 12h.
            // Vậy index 0 ở 12h.
            const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2)
            const extraSpins = 5 + Math.floor(Math.random() * 3) // 5-7 full rotations
            const finalRotation = rotation + (extraSpins * 360) + targetAngle

            setRotation(finalRotation)

            // Show result after spin completes (matches transition duration)
            setTimeout(() => {
                setIsSpinning(false)
                setResult(wonPrize)
                setSpinsRemaining(prev => prev - 1)

                toast.push(
                    <Notification title="Chúc mừng!" type="success">
                        Bạn đã nhận được {wonPrize}!
                    </Notification>
                )

                // Refresh data
                mutateConfig()
                mutateHistory()
                mutateWallet()
            }, 5000)

        } catch (error: unknown) {
            setIsSpinning(false)
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
                </Notification>
            )
        }
    }

    const handleBuySpins = async () => {
        try {
            const res = await fetch('/api/lucky-wheel/buy-spins', {
                method: 'POST',
                body: JSON.stringify({ amount: 1 })
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            toast.push(
                <Notification title="Thành công" type="success">
                    {data.message}
                </Notification>
            )
            mutateConfig()
            mutateWallet()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
                </Notification>
            )
        }
    }

    if (configLoading && !config) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-[500px] rounded-2xl" />
                    <Skeleton className="h-[500px] rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="smm-animate-fadeInUp">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <TbGift className="text-primary" />
                    Vòng Quay May Mắn
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Quay để nhận thưởng mỗi ngày!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wheel Section */}
                <div className="lg:col-span-2 smm-animate-fadeInScale">
                    <div className="smm-card p-8">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                {/* Outer glow ring */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-30 blur-xl animate-pulse"></div>

                                {/* Wheel Container */}
                                <div className="relative w-72 h-72 md:w-80 md:h-80">
                                    {/* Pointer */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                                        <div className="relative">
                                            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-2xl"></div>
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
                                        </div>
                                    </div>

                                    {/* Wheel Border */}
                                    <div className="absolute inset-0 rounded-full border-8 border-gray-900 shadow-[0_0_60px_rgba(102,126,234,0.5)]">
                                        {[...Array(16)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`absolute w-3 h-3 rounded-full ${isSpinning ? 'animate-pulse' : ''}`}
                                                style={{
                                                    backgroundColor: isSpinning ? '#FBBF24' : '#6B7280',
                                                    boxShadow: isSpinning ? '0 0 10px #FBBF24' : 'none',
                                                    left: `${50 + 47 * Math.cos((i * 22.5 - 90) * Math.PI / 180)}%`,
                                                    top: `${50 + 47 * Math.sin((i * 22.5 - 90) * Math.PI / 180)}%`,
                                                    transform: 'translate(-50%, -50%)',
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Wheel SVG */}
                                    <div
                                        ref={wheelRef}
                                        className="w-full h-full rounded-full overflow-hidden shadow-2xl"
                                        style={{
                                            transform: `rotate(${rotation}deg)`,
                                            transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                                        }}
                                    >
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            {prizes.map((prize, index) => {
                                                const angle = (360 / prizes.length) * index
                                                const startAngle = (angle - 90) * (Math.PI / 180)
                                                const endAngle = (angle + 360 / prizes.length - 90) * (Math.PI / 180)

                                                const x1 = 50 + 50 * Math.cos(startAngle)
                                                const y1 = 50 + 50 * Math.sin(startAngle)
                                                const x2 = 50 + 50 * Math.cos(endAngle)
                                                const y2 = 50 + 50 * Math.sin(endAngle)

                                                const largeArc = 360 / prizes.length > 180 ? 1 : 0

                                                return (
                                                    <g key={index}>
                                                        <path
                                                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                            fill={prize.color}
                                                            stroke="#fff"
                                                            strokeWidth="0.5"
                                                        />
                                                        <text
                                                            x="50"
                                                            y="18"
                                                            fill="white"
                                                            fontSize="3.5"
                                                            fontWeight="bold"
                                                            textAnchor="middle"
                                                            transform={`rotate(${angle + 360 / prizes.length / 2}, 50, 50)`}
                                                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                                        >
                                                            {prize.label}
                                                        </text>
                                                    </g>
                                                )
                                            })}
                                            <circle cx="50" cy="50" r="10" fill="#1F2937" stroke="#6B7280" strokeWidth="1" />
                                            <text x="50" y="52" fill="white" fontSize="4" fontWeight="bold" textAnchor="middle">SPIN</text>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={spinWheel}
                                disabled={isSpinning || spinsRemaining <= 0}
                                className={`mt-8 px-12 py-4 text-lg font-bold rounded-2xl transition-all transform ${isSpinning
                                    ? 'bg-gray-400 cursor-not-allowed scale-95'
                                    : spinsRemaining <= 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'smm-btn-glow bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 active:scale-95'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <TbSparkles className={isSpinning ? 'animate-spin' : ''} />
                                    {isSpinning ? 'Đang quay...' : `QUAY NGAY (${spinsRemaining} lượt)`}
                                </span>
                            </button>

                            {result && (
                                <div className="mt-6 p-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl text-center text-white shadow-lg smm-animate-fadeInScale">
                                    <div className="text-4xl mb-2">🎉</div>
                                    <p className="text-lg font-bold">Chúc mừng! Bạn nhận được:</p>
                                    <p className="text-3xl font-black mt-2">{result}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 smm-stagger">
                    <div className="smm-card p-5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TbInfoCircle className="text-blue-500" />
                            Thông tin
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Lượt quay còn lại</span>
                                <span className="text-2xl font-bold text-primary">{spinsRemaining}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Lượt miễn phí</span>
                                <span className="font-bold">{config?.spinsPerDay}/ngày</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Giá mua lượt</span>
                                <span className="font-bold text-orange-500">{config?.spinCost.toLocaleString()} VND/lượt</span>
                            </div>
                        </div>
                        <button
                            onClick={handleBuySpins}
                            className="smm-btn-primary w-full mt-4 flex items-center justify-center gap-2"
                        >
                            <TbCoin />
                            Mua thêm lượt quay
                        </button>
                    </div>

                    <div className="smm-card smm-card-gradient p-5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TbTrophy className="text-yellow-500" />
                            Giải thưởng
                        </h3>
                        <div className="space-y-2">
                            {prizes.map((prize, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: prize.color }} />
                                    <span className="flex-1 text-sm font-medium">{prize.label}</span>
                                    <span className="text-xs text-gray-400">{prize.probability}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="smm-card p-5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TbHistory className="text-green-500" />
                            Lịch sử quay
                        </h3>
                        <div className="space-y-3">
                            {historyLoading ? (
                                <Skeleton className="h-20 w-full" />
                            ) : history?.length > 0 ? (
                                history.map((item: { id: string, prize: string, createdAt: string }) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <span className="font-medium text-primary">{item.prize}</span>
                                        <span className="text-gray-400 text-xs">{dayjs(item.createdAt).format('DD/MM HH:mm')}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 text-sm py-4">Chưa có lượt quay nào</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LuckyWheelPage
