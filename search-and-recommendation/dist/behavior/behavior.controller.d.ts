import { TrackEventDto } from './behavior.dto';
import { BehaviorService } from './behavior.service';
export declare class BehaviorController {
    private readonly behaviorService;
    constructor(behaviorService: BehaviorService);
    trackEvent(dto: TrackEventDto): Promise<{
        success: boolean;
    }>;
}
