import { GrpcPermissionDeniedException } from "nestjs-grpc-exceptions"

export class SpinCooldownException extends GrpcPermissionDeniedException {
    constructor(now: Date, last: Date) {
        super(`Spin cooldown, ${Math.ceil((now.getTime() - last.getTime()) / 1000)} seconds remaining: ${last.toISOString()} (last spin), ${now.toISOString()} (now)`)
    }
}  

export class SpinSlotFewerThan8Exception extends GrpcPermissionDeniedException {
    constructor(slots: number) {
        super(`Spin slot fewer than 8: ${slots}`)
    }
}

export class SpinTransactionFailedException extends GrpcPermissionDeniedException {
    constructor(error: Error) {
        super(`Spin transaction failed: ${error.message}`)
    }
}