import { Injectable } from '@nestjs/common';
import { IOperatorApplicationRepository } from '../../domain/repository/operator-application.repository.interface';
import { OperatorApplication } from '../../domain/entity/operator-application.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { OperatorApplicationMapper } from '../mapper/operator-application.mapper';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

@Injectable()
export class PrismaOperatorApplicationRepository implements IOperatorApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(application: OperatorApplication): Promise<OperatorApplication> {
    const rawData = OperatorApplicationMapper.toPersistence(application);

    const savedModel = await this.prisma.operatorApplication.upsert({
      where: { id: rawData.id || '' },
      create: {
        userId: rawData.userId,
        name: rawData.name,
        phone: rawData.phone,
        address: rawData.address,
        status: rawData.status,
        rejectReason: rawData.rejectReason,
      },
      update: {
        name: rawData.name,
        phone: rawData.phone,
        address: rawData.address,
        status: rawData.status,
        rejectReason: rawData.rejectReason,
      },
    });

    return OperatorApplicationMapper.toDomain(savedModel);
  }

  async findPendingByUserId(userId: string): Promise<OperatorApplication | null> {
    const model = await this.prisma.operatorApplication.findFirst({
      where: {
        userId,
        status: OperatorApplicationStatus.PENDING as any,
      },
    });

    if (!model) {
      return null;
    }

    return OperatorApplicationMapper.toDomain(model);
  }

  async findById(id: string): Promise<OperatorApplication | null> {
    const model = await this.prisma.operatorApplication.findUnique({
      where: { id },
    });

    if (!model) {
      return null;
    }

    return OperatorApplicationMapper.toDomain(model);
  }

  async findAll(status?: OperatorApplicationStatus): Promise<OperatorApplication[]> {
    const models = await this.prisma.operatorApplication.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return models.map((m) => OperatorApplicationMapper.toDomain(m));
  }
}
