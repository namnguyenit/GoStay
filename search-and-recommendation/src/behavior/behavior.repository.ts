import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { RECOMMENDATION_POOL } from '../database/recommendation-write.pool';
import { TrackEventDto } from './behavior.dto';

@Injectable()
export class BehaviorRepository {
  private readonly logger = new Logger(BehaviorRepository.name);

  constructor(@Inject(RECOMMENDATION_POOL) private readonly pool: Pool) {}

  async saveEvent(dto: TrackEventDto) {
    try {
      const sql = `
        INSERT INTO public.recommendation_events (
          id, user_id, session_id, event_type, listing_id, landmark_id, query, filters, context
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `;
      const values = [
        randomUUID(),
        dto.userId || null,
        dto.sessionId || null,
        dto.eventType,
        dto.listingId || null,
        dto.landmarkId || null,
        dto.query || null,
        dto.filters ? JSON.stringify(dto.filters) : null,
        dto.context ? JSON.stringify(dto.context) : null,
      ];

      await this.pool.query(sql, values);
    } catch (error) {
      this.logger.error(`Error saving behavior event: ${error.message}`);
      // Mute the error to not break the frontend
    }
  }
}
