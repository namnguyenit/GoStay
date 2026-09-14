import type { IOperatorService } from "../port/operator.service.interface";
import { OperatorStatusEntity } from "../../domain/entity/operator-status.entity";
import { tokenStorage } from "@/modules/auth/composition";

export class OperatorService implements IOperatorService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getMyOperatorStatus(): Promise<OperatorStatusEntity> {
    const token = tokenStorage.getToken();
    const res = await fetch(
      this.apiBaseUrl + "/api/v1/operator-applications/me",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
      }
    );

    if (!res.ok) {
      return new OperatorStatusEntity({ isOperator: false });
    }

    const json = await res.json();
    const data = json.data || json;

    return new OperatorStatusEntity({
      isOperator: Boolean(data.isOperator),
      operator: data.operator,
      latestApplication: data.latestApplication,
    });
  }
}
