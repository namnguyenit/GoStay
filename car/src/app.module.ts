import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CarModule } from './car/car.module';
import { OperatorModule } from './operator/operator.module';

@Module({
  imports: [PrismaModule, CarModule, OperatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
