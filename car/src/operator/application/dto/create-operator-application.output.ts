import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

export interface CreateOperatorApplicationOutput {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  status: OperatorApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}
