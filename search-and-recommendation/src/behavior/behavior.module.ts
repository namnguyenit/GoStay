import { Module } from '@nestjs/common';
import { BehaviorController } from './behavior.controller';
import { BehaviorRepository } from './behavior.repository';
import { BehaviorService } from './behavior.service';

@Module({
  controllers: [BehaviorController],
  providers: [BehaviorRepository, BehaviorService],
  exports: [BehaviorService],
})
export class BehaviorModule {}
