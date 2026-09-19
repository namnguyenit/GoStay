import { OperatorOutput } from './operator.output';

export interface GetOperatorsOutput {
  data: OperatorOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
