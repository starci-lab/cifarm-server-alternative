export enum BullQueueName {
    Crop = "crop",
    Animal = "animal",
    Delivery = "delivery",
    Energy = "energy"
}

export interface BullQueueData {
    name: string
    batchSize: number
    prefix?: string
}

export interface RegisterQueueOptions {
    queueName?: BullQueueName
    isGlobal?: boolean
}
