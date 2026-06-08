import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { InventoryClient } from './inventory.client';

@Global()
@Module({
  imports: [HttpModule],
  providers: [InventoryClient],
  exports: [InventoryClient],
})
export class InventoryModule {}
