import { fetchApi } from "./api";
import type { Car, OperatorApplication, PaginatedResponse } from "../types";

export interface GetCarsParams {
  page?: number;
  limit?: number;
  brand?: string;
  type?: string;
  status?: string;
  search?: string;
}

export interface CreateCarInput {
  name: string;
  brand?: string;
  licensePlate: string;
  seatCapacity: number;
  type?: string;
  pricePerTrip?: number;
  description?: string;
  images?: string[];
}

export interface CreateOperatorInput {
  name: string;
  phone: string;
  address: string;
}

export const CarService = {
  async getCars(params?: GetCarsParams): Promise<PaginatedResponse<Car>> {
    return fetchApi<PaginatedResponse<Car>>("/api/v1/cars", {
      method: "GET",
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getCarById(id: string): Promise<Car> {
    return fetchApi<Car>(`/api/v1/cars/${id}`, {
      method: "GET",
    });
  },

  async addCar(data: CreateCarInput): Promise<Car> {
    return fetchApi<Car>("/api/v1/cars", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createOperatorApplication(
    data: CreateOperatorInput
  ): Promise<OperatorApplication> {
    return fetchApi<OperatorApplication>("/api/v1/operator-applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getOperatorApplications(): Promise<OperatorApplication[]> {
    return fetchApi<OperatorApplication[]>("/api/v1/operator-applications", {
      method: "GET",
    });
  },

  async processOperatorApplication(
    id: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string
  ): Promise<OperatorApplication> {
    return fetchApi<OperatorApplication>(
      `/api/v1/operator-applications/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ status, rejectionReason }),
      }
    );
  },
};
