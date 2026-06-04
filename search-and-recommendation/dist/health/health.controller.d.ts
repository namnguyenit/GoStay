import { HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private http;
    private memory;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, memory: MemoryHealthIndicator);
    checkLiveness(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">> | undefined>>;
    checkReadiness(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>>, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>>> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>>> | undefined>>;
}
