// SMM Provider Types and Base Class

export interface ProviderService {
    id: string | number
    name: string
    category: string
    rate: number // Price per 1000
    min: number
    max: number
    description?: string
}

export interface ProviderOrderStatus {
    status: 'Pending' | 'Processing' | 'In progress' | 'Completed' | 'Partial' | 'Cancelled' | 'Error'
    charge: string
    startCount?: string
    remains?: string
}

export interface ProviderBalance {
    balance: string
    currency: string
}

export interface CreateOrderParams {
    service: string | number
    link: string
    quantity: number
    comments?: string  // For comment services
    username?: string  // For some services
}

export interface CreateOrderResult {
    order: string | number
}

export abstract class BaseSMMProvider {
    protected apiUrl: string
    protected apiKey: string

    constructor(apiUrl: string, apiKey: string) {
        this.apiUrl = apiUrl
        this.apiKey = apiKey
    }

    // Get account balance
    abstract getBalance(): Promise<ProviderBalance>

    // Get list of services
    abstract getServices(): Promise<ProviderService[]>

    // Create new order
    abstract createOrder(params: CreateOrderParams): Promise<CreateOrderResult>

    // Get order status
    abstract getOrderStatus(orderId: string | number): Promise<ProviderOrderStatus>

    // Get multiple orders status
    abstract getMultipleOrdersStatus(orderIds: (string | number)[]): Promise<Record<string, ProviderOrderStatus>>

    // Cancel order (if supported)
    abstract cancelOrder(orderId: string | number): Promise<void>

    // Refill order (if supported)
    abstract refillOrder(orderId: string | number): Promise<{ refillId: string | number }>

    // Make API request
    protected async request<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key: this.apiKey,
                action,
                ...params,
            }),
        })

        if (!response.ok) {
            throw new Error(`Provider API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.error) {
            throw new Error(data.error)
        }

        return data as T
    }
}
