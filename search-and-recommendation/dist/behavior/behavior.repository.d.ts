import { Pool } from 'pg';
import { TrackEventDto } from './behavior.dto';
export declare class BehaviorRepository {
    private readonly pool;
    private readonly logger;
    constructor(pool: Pool);
    saveEvent(dto: TrackEventDto): Promise<void>;
}
