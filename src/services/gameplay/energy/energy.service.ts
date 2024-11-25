import { Injectable } from "@nestjs/common"
import { EnergyExceedsMaximumException, EnergyNotEnoughException } from "@src/exceptions"
import {
    AddRequest,
    AddResponse,
    SubstractRequest,
    SubstractResponse
} from "./energy.dto"
import { CheckSufficientRequest } from "@src/types"

@Injectable()
export class EnergyService {
    constructor() {}

    public add(request: AddRequest): AddResponse {
        const { energy, entity } = request
        const maxEnergy = this.getMaxEnergy(entity.level)
        if (request.entity.energy + request.energy > maxEnergy)
            throw new EnergyExceedsMaximumException(entity.energy + energy, maxEnergy)
        return {
            energy: entity.energy + energy
        }
    }

    public substract(request: SubstractRequest): SubstractResponse {
        const { energy, entity } = request
        if (entity.energy - energy < 0)
            throw new EnergyExceedsMaximumException(entity.energy - request.energy, 0)
        return {
            energy: entity.energy - energy
        }
    }

    private getMaxEnergy(level: number): number {
        return 50 + (level - 1) * 3
    }

    public checkSufficient({ current, required }: CheckSufficientRequest) {
        if (current < required)
            throw new EnergyNotEnoughException(current, required)
    }
}
