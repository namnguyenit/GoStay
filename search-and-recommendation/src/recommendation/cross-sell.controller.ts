import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CrossSellRequestDto } from './recommendation.dto';
import { CrossSellService } from './cross-sell.service';

@Controller('api/v1/recommendations/cross-sell')
export class CrossSellController {
  constructor(private readonly crossSellService: CrossSellService) {}

  @Post('cart-item')
  async recommendForCartItem(
    @Body(new ValidationPipe({ transform: true })) dto: CrossSellRequestDto,
  ) {
    return this.crossSellService.recommendForCartItem(dto);
  }
}
