import type { NextAuthConfig } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

// Edge-compatible auth config (no bcrypt, no database operations)
export default {
    providers: [
        Github({
            clientId: process.env.GITHUB_AUTH_CLIENT_ID,
            clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.authority = user.authority
            }
            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub,
                    authority: token.authority as string[],
                },
            }
        },
    },
} satisfies NextAuthConfig
