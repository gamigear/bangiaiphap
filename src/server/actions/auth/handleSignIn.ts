'use server'

import { signIn } from '@/auth'
import appConfig from '@/configs/app.config'
import { AuthError } from 'next-auth'
import type { SignInCredential } from '@/@types/auth'

export const onSignInWithCredentials = async (
    { email, password }: SignInCredential,
    callbackUrl?: string,
) => {
    console.log('onSignInWithCredentials called with:', email)
    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: callbackUrl || appConfig.authenticatedEntryPath,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            console.log('AuthError type:', error.type)
            /** Customize error message based on AuthError */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            switch ((error as any).type) {
                case 'CredentialsSignin':
                    return { error: 'Thông tin đăng nhập không chính xác!' }
                default:
                    return { error: 'Đã có lỗi xảy ra!' }
            }
        }
        console.error('Non-AuthError during signin:', error)
        throw error
    }
}
