import { GetOperatorsInput } from '../dto/get-operators.input';
import { GetOperatorsOutput } from '../dto/get-operators.output';

export interface IGetOperatorsUseCase {
  execute(input: GetOperatorsInput): Promise<GetOperatorsOutput>;
}
