import type { IOperatorService } from "../application/port/operator.service.interface";
import { OperatorService } from "../application/service/operator.service";

const GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:5555";

export class OperatorModuleFactory {
  public static createOperatorService(
    customGatewayUrl?: string
  ): IOperatorService {
    return new OperatorService(customGatewayUrl || GATEWAY_URL);
  }
}

export const operatorService: IOperatorService =
  OperatorModuleFactory.createOperatorService();
