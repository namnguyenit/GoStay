import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InventoryClient {
  private readonly logger = new Logger(InventoryClient.name);
  private readonly baseUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('INVENTORY_SERVICE_URL')!;
    this.internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN')!;
  }

  async checkBatchAvailability(payload: any): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/v1/internal/inventory/batch-check-availability`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'X-Internal-Service-Token': this.internalToken,
          },
          timeout: 1000, // 1s timeout
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to check batch availability: ${error.message}`);
      // Return empty or throw based on strategy. Fail silent for cross-sell is preferred.
      return { availableListingIds: [] };
    }
  }
}
