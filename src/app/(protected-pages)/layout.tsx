import React from 'react'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import { ReactNode } from 'react'
import { MobileBottomNav } from '@/components/smm'

const Layout = async ({ children }: { children: ReactNode }) => {
    return (
        <PostLoginLayout>
            {children}
            <MobileBottomNav />
        </PostLoginLayout>
    )
}

export default Layout
