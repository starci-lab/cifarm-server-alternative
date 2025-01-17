export type Empty = Record<string, never>

export interface HttpResponse<TData = undefined> {
    message: string
    data?: TData
}

export interface TransactionResult {
    transactionHash: string
}

export interface TransactionHttpResponseData {
    transactionHash: string
}

export type Atomic = string | number | boolean | object

export interface BaseOptionsOptions<TOptions> extends BaseOptions {
    options?: TOptions
}

export interface BaseOptions {
    injectionToken?: string
    useGlobalImports?: boolean
}

export interface ClassLike {
    name: string
}
