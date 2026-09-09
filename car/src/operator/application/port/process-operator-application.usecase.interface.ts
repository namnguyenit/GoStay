import { OperatorApplicationOutput } from '../dto/operator-application.output';
import { OperatorOutput } from '../dto/operator.output';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

export interface ProcessOperatorApplicationInput {
  applicationId: string;
  status: OperatorApplicationStatus.APPROVED | OperatorApplicationStatus.REJECTED;
  rejectReason?: string;
}

export interface ProcessOperatorApplicationResult {
  application: OperatorApplicationOutput;
  operator?: OperatorOutput;
}

export interface IProcessOperatorApplicationUseCase {
  execute(input: ProcessOperatorApplicationInput): Promise<ProcessOperatorApplicationResult>;
}
