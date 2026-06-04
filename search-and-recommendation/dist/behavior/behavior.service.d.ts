import { TrackEventDto } from './behavior.dto';
import { BehaviorRepository } from './behavior.repository';
export declare class BehaviorService {
    private readonly behaviorRepo;
    constructor(behaviorRepo: BehaviorRepository);
    trackEvent(dto: TrackEventDto): Promise<{
        success: boolean;
    }>;
}
