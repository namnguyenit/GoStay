import type {
  ICarService,
  GetCarsParams,
  GetCarsResult,
  CreateCarDTO,
} from "../port/car.service.interface";
import { CarEntity } from "../../domain/entity/car.entity";
import { LicensePlateVO } from "../../domain/value-object/license-plate.vo";
import { tokenStorage } from "@/modules/auth/composition";

export class CarService implements ICarService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getCars(params?: GetCarsParams): Promise<GetCarsResult> {
    const token = tokenStorage.getToken();
    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.keyword && params.keyword.trim()) {
      query.append("keyword", params.keyword.trim());
    }
    if (params?.type && params.type.trim()) {
      query.append("type", params.type.trim());
    }
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const url = `${this.apiBaseUrl}/api/v1/cars${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    });

    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (res.status === 403) {
      throw new Error(
        "Tài khoản của bạn chưa được cấp quyền Nhà xe (Operator). Vui lòng nộp đơn đăng ký và chờ Quản trị viên phê duyệt."
      );
    }

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const msg = Array.isArray(errorJson?.message)
        ? errorJson.message.join(", ")
        : errorJson?.message || "Không thể tải danh sách xe.";
      throw new Error(msg);
    }

    const json = await res.json();
    const responseData = json.data || json;

    const rawList = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? responseData
        : [];

    const carEntities = rawList.map((item: any) =>
      CarEntity.fromApiResponse(item)
    );

    const kpi = responseData.kpi || {
      totalCars: carEntities.length,
      sleeperCars: carEntities.filter((c: CarEntity) => c.type === "SLEEPER")
        .length,
      limousineCars: carEntities.filter(
        (c: CarEntity) => c.type === "LIMOUSINE"
      ).length,
      seatCars: carEntities.filter((c: CarEntity) => c.type === "SEAT").length,
    };

    const pagination = responseData.pagination || {
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalItems: carEntities.length,
      totalPages: 1,
    };

    return {
      data: carEntities,
      kpi,
      pagination,
    };
  }

  async addCar(dto: CreateCarDTO): Promise<CarEntity> {
    const token = tokenStorage.getToken();

    // Client-side domain validation
    if (
      !dto.name ||
      dto.name.trim().length < 3 ||
      dto.name.trim().length > 100
    ) {
      throw new Error("Tên xe bắt buộc nhập và phải từ 3 đến 100 ký tự.");
    }

    const plateError = LicensePlateVO.getValidationError(dto.licensePlate);
    if (plateError) {
      throw new Error(plateError);
    }

    if (!dto.totalSeats || dto.totalSeats <= 0) {
      throw new Error("Tổng số ghế phải là số nguyên dương lớn hơn 0.");
    }

    const payload = {
      name: dto.name.trim(),
      type: dto.type,
      licensePlate: LicensePlateVO.normalize(dto.licensePlate),
      totalSeats: Number(dto.totalSeats),
    };

    const res = await fetch(`${this.apiBaseUrl}/api/v1/cars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (res.status === 403) {
      throw new Error(
        "Tài khoản của bạn chưa được cấp quyền Nhà xe (Operator). Vui lòng nộp đơn đăng ký Nhà xe và chờ Admin phê duyệt trước khi thêm xe."
      );
    }

    if (res.status === 409) {
      throw new Error(
        "Biển số xe đã tồn tại trong hệ thống, vui lòng kiểm tra lại."
      );
    }

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const msg = Array.isArray(errorJson?.message)
        ? errorJson.message.join(", ")
        : errorJson?.message || "Thêm xe mới thất bại.";
      throw new Error(msg);
    }

    const json = await res.json();
    const createdData = json.data || json;
    return CarEntity.fromApiResponse(createdData);
  }
}
