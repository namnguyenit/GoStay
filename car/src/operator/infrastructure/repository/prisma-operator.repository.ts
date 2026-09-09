import { Injectable } from '@nestjs/common';
import { IOperatorRepository } from '../../domain/repository/operator.repository.interface';
import { Operator } from '../../domain/entity/operator.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { OperatorMapper } from '../mapper/operator.mapper';

@Injectable()
export class PrismaOperatorRepository implements IOperatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(operator: Operator): Promise<Operator> {
    const rawData = OperatorMapper.toPersistence(operator);

    const savedModel = await this.prisma.operator.upsert({
      where: { id: rawData.id || '' },
      create: {
        userId: rawData.userId,
        name: rawData.name,
      },
      update: {
        name: rawData.name,
      },
    });

    return OperatorMapper.toDomain(savedModel);
  }

  async findByUserId(userId: string): Promise<Operator | null> {
    const model = await this.prisma.operator.findFirst({
      where: { userId },
    });

    if (!model) {
      return null;
    }

    return OperatorMapper.toDomain(model);
  }

  async findById(id: string): Promise<Operator | null> {
    const model = await this.prisma.operator.findUnique({
      where: { id },
    });

    if (!model) {
      return null;
    }

    return OperatorMapper.toDomain(model);
  }
}
