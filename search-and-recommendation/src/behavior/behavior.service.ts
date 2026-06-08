import { Injectable } from '@nestjs/common';
import { TrackEventDto } from './behavior.dto';
import { BehaviorRepository } from './behavior.repository';

@Injectable()
export class BehaviorService {
  constructor(private readonly behaviorRepo: BehaviorRepository) {}

  async trackEvent(dto: TrackEventDto) {
    // Send to repository asynchronously without blocking
    this.behaviorRepo.saveEvent(dto).catch(() => {
      // already muted in repo, just a safety catch
    });
    return { success: true };
  }
}
