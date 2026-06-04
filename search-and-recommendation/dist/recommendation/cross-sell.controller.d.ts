import { CrossSellRequestDto } from './recommendation.dto';
import { CrossSellService } from './cross-sell.service';
export declare class CrossSellController {
    private readonly crossSellService;
    constructor(crossSellService: CrossSellService);
    recommendForCartItem(dto: CrossSellRequestDto): Promise<any[]>;
}
