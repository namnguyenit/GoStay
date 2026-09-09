import { OperatorApplicationOutput } from '../dto/operator-application.output';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

export interface IGetOperatorApplicationsUseCase {
  execute(status?: OperatorApplicationStatus): Promise<OperatorApplicationOutput[]>;
}
