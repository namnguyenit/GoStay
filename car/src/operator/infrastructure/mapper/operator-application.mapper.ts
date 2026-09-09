import { OperatorApplication as PrismaOperatorApplicationModel, OperatorApplicationStatus as PrismaStatus } from '@prisma/client';
import { OperatorApplication } from '../../domain/entity/operator-application.entity';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';
import { PhoneNumber } from '../../domain/value-object/phone-number.vo';

export class OperatorApplicationMapper {
  public static toDomain(model: PrismaOperatorApplicationModel): OperatorApplication {
    return OperatorApplication.reconstruct({
      id: model.id,
      userId: model.userId,
      name: model.name,
      phone: new PhoneNumber(model.phone),
      address: model.address,
      status: model.status as unknown as OperatorApplicationStatus,
      rejectReason: model.rejectReason,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  public static toPersistence(entity: OperatorApplication) {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      phone: entity.phone.getValue(),
      address: entity.address,
      status: entity.status as unknown as PrismaStatus,
      rejectReason: entity.rejectReason || null,
    };
  }
}
