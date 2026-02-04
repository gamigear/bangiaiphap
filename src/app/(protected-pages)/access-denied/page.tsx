'use client'

import React from 'react'
import { Card, Button } from '@/components/ui'
import { TbLockSquareRounded } from 'react-icons/tb'
import Link from 'next/link'

const AccessDenied = () => {
    return (
        <div className="h-[80vh] flex items-center justify-center smm-main-content">
            <Card className="max-w-md w-full p-8 text-center smm-card-gradient">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl">
                        <TbLockSquareRounded size={48} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                </p>
                <Link href="/dashboard">
                    <Button block variant="solid">
                        Quay lại trang chủ
                    </Button>
                </Link>
            </Card>
        </div>
    )
}

export default AccessDenied
