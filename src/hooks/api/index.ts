import useSWR from 'swr'

// Generic fetcher
const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Có lỗi xảy ra')
    }
    return res.json()
}

// Wallet hook
export function useWallet() {
    const { data, error, isLoading, mutate } = useSWR('/api/wallet', fetcher, {
        revalidateOnFocus: true,
        refreshInterval: 30000, // Refresh every 30s
    })

    return {
        wallet: data?.data,
        isLoading,
        isError: error,
        mutate,
    }
}

// Services hook
export function useServices(params?: {
    category?: string
    categorySlug?: string
    search?: string
    page?: number
    limit?: number
}) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.categorySlug) searchParams.set('category', params.categorySlug)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))

    const url = `/api/services${searchParams.toString() ? `?${searchParams}` : ''}`

    const { data, error, isLoading, mutate } = useSWR(url, fetcher)

    return {
        services: data?.data?.items || [],
        pagination: data?.data ? {
            total: data.data.total,
            page: data.data.page,
            pageSize: data.data.pageSize,
            totalPages: data.data.totalPages,
        } : null,
        isLoading,
        isError: error,
        mutate,
    }
}

// Categories hook
export function useCategories() {
    const { data, error, isLoading } = useSWR('/api/services/categories', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // Cache for 1 minute
    })

    return {
        categories: data?.data || [],
        isLoading,
        isError: error,
    }
}

// Orders hook
export function useOrders(params?: {
    status?: string
    page?: number
    limit?: number
}) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))

    const url = `/api/orders${searchParams.toString() ? `?${searchParams}` : ''}`

    const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
        revalidateOnFocus: true,
        refreshInterval: 15000, // Refresh every 15s for order status updates
    })

    return {
        orders: data?.data?.items || [],
        pagination: data?.data ? {
            total: data.data.total,
            page: data.data.page,
            pageSize: data.data.pageSize,
            totalPages: data.data.totalPages,
        } : null,
        isLoading,
        isError: error,
        mutate,
    }
}

// Transaction history hook
export function useTransactions(params?: {
    type?: string
    page?: number
    limit?: number
}) {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))

    const url = `/api/wallet/history${searchParams.toString() ? `?${searchParams}` : ''}`

    const { data, error, isLoading, mutate } = useSWR(url, fetcher)

    return {
        transactions: data?.data?.items || [],
        pagination: data?.data ? {
            total: data.data.total,
            page: data.data.page,
            pageSize: data.data.pageSize,
            totalPages: data.data.totalPages,
        } : null,
        isLoading,
        isError: error,
        mutate,
    }
}

// Lucky Wheel hook
export function useLuckyWheel() {
    const { data, error, isLoading, mutate } = useSWR('/api/lucky-wheel/config', fetcher)

    return {
        config: data?.data,
        isLoading,
        isError: error,
        mutate,
    }
}

export function useLuckyWheelHistory() {
    const { data, error, isLoading, mutate } = useSWR('/api/lucky-wheel/history', fetcher)

    return {
        history: data?.data,
        isLoading,
        isError: error,
        mutate,
    }
}
