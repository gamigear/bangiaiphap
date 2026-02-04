import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Default settings
const defaultSettings = {
    siteName: 'BanTuongTac.com',
    siteDescription: 'Dịch vụ tăng tương tác mạng xã hội uy tín',
    contactEmail: 'support@bantuongtac.com',
    contactPhone: '0123456789',
    telegramSupport: '@bantuongtac_support',
    bankName: 'Vietcombank',
    bankAccountNumber: '1234567890',
    bankAccountName: 'NGUYEN VAN A',
    bankBranch: 'Ho Chi Minh',
    minDeposit: 10000,
    depositBonus: 0,
    depositBonusMinAmount: 100000,
    smmApiUrl: '',
    smmApiKey: '',
    maintenanceMode: false,
    registrationEnabled: true,
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.authority?.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
        }

        // Get all settings from database
        const settings = await prisma.setting.findMany()

        // Build settings object from database
        const settingsObj = { ...defaultSettings }
        for (const setting of settings) {
            (settingsObj as any)[setting.key] = setting.value
        }

        return NextResponse.json({ success: true, data: settingsObj })
    } catch (error) {
        console.error('Admin settings GET error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.authority?.includes('admin')) {
            return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
        }

        const body = await request.json()

        // Upsert each setting to database
        for (const [key, value] of Object.entries(body)) {
            await prisma.setting.upsert({
                where: { key },
                update: { value: value as any },
                create: { key, value: value as any }
            })
        }

        // Get updated settings
        const settings = await prisma.setting.findMany()
        const settingsObj = { ...defaultSettings }
        for (const setting of settings) {
            (settingsObj as any)[setting.key] = setting.value
        }

        return NextResponse.json({ success: true, data: settingsObj })
    } catch (error) {
        console.error('Admin settings POST error:', error)
        return NextResponse.json({ success: false, error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
