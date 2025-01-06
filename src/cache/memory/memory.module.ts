import { createCache } from "cache-manager"
import { Module } from "@nestjs/common"
import { CacheMemoryService } from "./memory.service"
import { CacheableMemory, Keyv } from "cacheable"
import { CACHE_MEMORY_MANAGER } from "./memory.constants"
@Module({})
export class CacheMemoryModule {
    public static forRoot() {
        // Create a cache manager with a memory store
        const cache = createCache({
            stores: [
                new Keyv({
                    store: new CacheableMemory({ ttl: 60000, lruSize: 5000 })
                })
            ]
        })

        return {
            module: CacheMemoryModule,
            providers: [{ provide: CACHE_MEMORY_MANAGER, useValue: cache }, CacheMemoryService],
            exports: [CacheMemoryService]
        }
    }
}
