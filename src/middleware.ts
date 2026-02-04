import NextAuth from 'next-auth'

import authConfig from '@/configs/auth.edge.config'
import {
    authRoutes as _authRoutes,
    publicRoutes as _publicRoutes,
    protectedRoutes as _protectedRoutes
} from '@/configs/routes.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import appConfig from '@/configs/app.config'

const { auth } = NextAuth(authConfig)

const publicRoutes = Object.entries(_publicRoutes).map(([key]) => key)
const authRoutes = Object.entries(_authRoutes).map(([key]) => key)

const apiAuthPrefix = `${appConfig.apiPrefix}/auth`

export default auth((req) => {
    const { nextUrl } = req
    const isSignedIn = !!req.auth

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    /** Skip auth middleware for api routes */
    if (isApiAuthRoute) return

    if (isAuthRoute) {
        if (isSignedIn) {
            /** Redirect to authenticated entry path if signed in & path is auth route */
            return Response.redirect(
                new URL(appConfig.authenticatedEntryPath, nextUrl),
            )
        }
        return
    }

    /** Redirect to authenticated entry path if signed in & path is public route */
    if (!isSignedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
            callbackUrl += nextUrl.search
        }

        return Response.redirect(
            new URL(
                `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${callbackUrl}`,
                nextUrl,
            ),
        )
    }

    /** Enable role based access */
    if (isSignedIn && nextUrl.pathname !== '/access-denied' && !nextUrl.pathname.startsWith(appConfig.apiPrefix)) {
        const routeMeta = (_protectedRoutes as any)[nextUrl.pathname]
        const existingRoute = !!routeMeta
        const userAuthority = req.auth?.user?.authority || []

        // Nếu là admin thì được vào tất cả các route
        const isAdmin = userAuthority.includes('admin')

        if (existingRoute && !isAdmin) {
            const requiredAuthority = routeMeta.authority || []
            if (requiredAuthority.length > 0) {
                const isAuthorized = requiredAuthority.some((role: string) => userAuthority.includes(role))
                if (!isAuthorized) {
                    return Response.redirect(new URL('/dashboard', nextUrl))
                }
            }
        }
    }
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}
