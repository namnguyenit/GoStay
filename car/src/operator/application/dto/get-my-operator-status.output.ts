import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

export interface GetMyOperatorStatusOutput {
  isOperator: boolean;
  operator?: {
    id: string;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  latestApplication?: {
    id: string;
    userId: string;
    name: string;
    phone: string;
    address: string;
    status: OperatorApplicationStatus;
    rejectReason?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
