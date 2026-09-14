import type { UserEntity } from "../../domain/entity/user.entity";

export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth?: string;
}

export interface IAuthService {
  login(dto: LoginDTO): Promise<string>;
  register(dto: RegisterDTO): Promise<void>;
  getMe(): Promise<UserEntity>;
  logout(): void;
  getToken(): string | null;
}
