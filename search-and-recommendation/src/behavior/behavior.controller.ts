import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { TrackEventDto } from './behavior.dto';
import { BehaviorService } from './behavior.service';

@Controller('api/v1/recommendations/events')
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Post()
  async trackEvent(@Body(new ValidationPipe({ transform: true })) dto: TrackEventDto) {
    return this.behaviorService.trackEvent(dto);
  }
}
