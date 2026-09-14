import { OperatorApplication } from '../entity/operator-application.entity';
import { OperatorApplicationStatus } from '../value-object/operator-application-status.enum';

export interface IOperatorApplicationRepository {
  save(application: OperatorApplication): Promise<OperatorApplication>;
  findPendingByUserId(userId: string): Promise<OperatorApplication | null>;
  findLatestByUserId(userId: string): Promise<OperatorApplication | null>;
  findById(id: string): Promise<OperatorApplication | null>;
  findAll(status?: OperatorApplicationStatus): Promise<OperatorApplication[]>;
}
