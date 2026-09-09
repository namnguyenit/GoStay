import { Operator } from '../entity/operator.entity';

export interface IOperatorRepository {
  save(operator: Operator): Promise<Operator>;
  findByUserId(userId: string): Promise<Operator | null>;
  findById(id: string): Promise<Operator | null>;
}
