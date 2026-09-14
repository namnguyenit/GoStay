import { GetMyOperatorStatusInput } from '../dto/get-my-operator-status.input';
import { GetMyOperatorStatusOutput } from '../dto/get-my-operator-status.output';

export interface IGetMyOperatorStatusUseCase {
  execute(input: GetMyOperatorStatusInput): Promise<GetMyOperatorStatusOutput>;
}
