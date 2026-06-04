import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // Add DB/Redis checks here once they are integrated with terminus indicators
    ]);
  }
}
