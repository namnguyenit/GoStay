import { AddCarInput } from '../dto/add-car.input';
import { AddCarOutput } from '../dto/add-car.output';

export interface IAddCarUseCase {
  execute(input: AddCarInput): Promise<AddCarOutput>;
}
