import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

export interface OperatorApplicationOutput {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  status: OperatorApplicationStatus;
  rejectReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
