import { GetCarsInput } from '../dto/get-cars.input';
import { GetCarsOutput } from '../dto/get-cars.output';

export interface IGetCarsUseCase {
  execute(input: GetCarsInput): Promise<GetCarsOutput>;
}
