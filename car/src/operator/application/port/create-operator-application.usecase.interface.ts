import { CreateOperatorApplicationInput } from '../dto/create-operator-application.input';
import { CreateOperatorApplicationOutput } from '../dto/create-operator-application.output';

export interface ICreateOperatorApplicationUseCase {
  execute(input: CreateOperatorApplicationInput): Promise<CreateOperatorApplicationOutput>;
}
