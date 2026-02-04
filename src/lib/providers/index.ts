// SMM Providers Factory
// Use this to get the appropriate provider instance

import { GenericSMMProvider } from './generic'
import type { BaseSMMProvider } from './base'

export type ProviderName = 'yoyomedia' | 'smmpanel' | 'godsmm' | 'nawabsmm' | 'custom'

interface ProviderConfig {
    apiUrl: string
    apiKey: string
}

const PROVIDER_CONFIGS: Record<string, Pick<ProviderConfig, 'apiUrl'>> = {
    yoyomedia: { apiUrl: 'https://yoyomedia.co/api/v2' },
    smmpanel: { apiUrl: 'https://smmpanel.co/api/v2' },
    godsmm: { apiUrl: 'https://godsmm.com/api/v2' },
    nawabsmm: { apiUrl: 'https://nawabsmm.com/api/v2' },
}

export function getProvider(name: ProviderName, apiKey: string, customApiUrl?: string): BaseSMMProvider {
    const config = PROVIDER_CONFIGS[name]
    const apiUrl = customApiUrl || config?.apiUrl

    if (!apiUrl) {
        throw new Error(`Unknown provider: ${name}`)
    }

    // For now, all providers use the generic implementation
    // Add specific provider classes as needed
    return new GenericSMMProvider({
        apiUrl,
        apiKey,
        name,
    })
}

// Get provider from database config
export async function getProviderFromDb(providerId: string): Promise<BaseSMMProvider | null> {
    // Import prisma here to avoid circular dependencies
    const { prisma } = await import('../prisma')

    const provider = await prisma.sMMProvider.findUnique({
        where: { id: providerId },
    })

    if (!provider || !provider.isActive) {
        return null
    }

    return new GenericSMMProvider({
        apiUrl: provider.apiUrl,
        apiKey: provider.apiKey,
        name: provider.name,
    })
}

export { BaseSMMProvider } from './base'
export { GenericSMMProvider } from './generic'
export type * from './base'
