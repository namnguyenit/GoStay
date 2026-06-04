import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class InventoryClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly internalToken;
    constructor(httpService: HttpService, configService: ConfigService);
    checkBatchAvailability(payload: any): Promise<any>;
}
