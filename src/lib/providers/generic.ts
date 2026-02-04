// Generic SMM Panel Provider
// Most SMM panels use the same API structure

import {
    BaseSMMProvider,
    ProviderBalance,
    ProviderService,
    ProviderOrderStatus,
    CreateOrderParams,
    CreateOrderResult,
} from './base'

interface GenericProviderConfig {
    apiUrl: string
    apiKey: string
    name?: string
}

export class GenericSMMProvider extends BaseSMMProvider {
    public readonly name: string

    constructor(config: GenericProviderConfig) {
        super(config.apiUrl, config.apiKey)
        this.name = config.name || 'GenericProvider'
    }

    async getBalance(): Promise<ProviderBalance> {
        const response = await this.request<{ balance: string; currency: string }>('balance')
        return {
            balance: response.balance,
            currency: response.currency || 'VND',
        }
    }

    async getServices(): Promise<ProviderService[]> {
        const services = await this.request<Array<{
            service: string | number
            name: string
            category: string
            rate: string | number
            min: string | number
            max: string | number
            desc?: string
            description?: string
        }>>('services')

        return services.map((s) => ({
            id: s.service,
            name: s.name,
            category: s.category,
            rate: parseFloat(String(s.rate)),
            min: parseInt(String(s.min)),
            max: parseInt(String(s.max)),
            description: s.desc || s.description,
        }))
    }

    async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
        const response = await this.request<{ order: string | number }>('add', {
            service: params.service,
            link: params.link,
            quantity: params.quantity,
            ...(params.comments && { comments: params.comments }),
            ...(params.username && { username: params.username }),
        })

        return { order: response.order }
    }

    async getOrderStatus(orderId: string | number): Promise<ProviderOrderStatus> {
        const response = await this.request<{
            status: string
            charge: string
            start_count?: string
            remains?: string
        }>('status', { order: orderId })

        return {
            status: this.normalizeStatus(response.status),
            charge: response.charge,
            startCount: response.start_count,
            remains: response.remains,
        }
    }

    async getMultipleOrdersStatus(orderIds: (string | number)[]): Promise<Record<string, ProviderOrderStatus>> {
        const response = await this.request<Record<string, {
            status: string
            charge: string
            start_count?: string
            remains?: string
        }>>('orders', { orders: orderIds.join(',') })

        const result: Record<string, ProviderOrderStatus> = {}
        for (const [id, data] of Object.entries(response)) {
            result[id] = {
                status: this.normalizeStatus(data.status),
                charge: data.charge,
                startCount: data.start_count,
                remains: data.remains,
            }
        }
        return result
    }

    async cancelOrder(orderId: string | number): Promise<void> {
        await this.request('cancel', { order: orderId })
    }

    async refillOrder(orderId: string | number): Promise<{ refillId: string | number }> {
        const response = await this.request<{ refill: string | number }>('refill', { order: orderId })
        return { refillId: response.refill }
    }

    private normalizeStatus(status: string): ProviderOrderStatus['status'] {
        const statusMap: Record<string, ProviderOrderStatus['status']> = {
            'pending': 'Pending',
            'processing': 'Processing',
            'in progress': 'In progress',
            'inprogress': 'In progress',
            'completed': 'Completed',
            'complete': 'Completed',
            'partial': 'Partial',
            'cancelled': 'Cancelled',
            'canceled': 'Cancelled',
            'refunded': 'Cancelled',
            'error': 'Error',
            'fail': 'Error',
            'failed': 'Error',
        }
        return statusMap[status.toLowerCase()] || 'Pending'
    }
}
