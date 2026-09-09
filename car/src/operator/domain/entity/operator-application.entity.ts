import { OperatorApplicationStatus } from '../value-object/operator-application-status.enum';
import { PhoneNumber } from '../value-object/phone-number.vo';

export interface OperatorApplicationProps {
  id?: string;
  userId: string;
  name: string;
  phone: string | PhoneNumber;
  address: string;
  status?: OperatorApplicationStatus;
  rejectReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OperatorApplication {
  private readonly _id?: string;
  private readonly _userId: string;
  private _name: string;
  private _phone: PhoneNumber;
  private _address: string;
  private _status: OperatorApplicationStatus;
  private _rejectReason?: string | null;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: OperatorApplicationProps) {
    this.validateUserId(props.userId);
    this.validateName(props.name);
    this.validateAddress(props.address);

    this._id = props.id;
    this._userId = props.userId.trim();
    this._name = props.name.trim();
    this._phone =
      props.phone instanceof PhoneNumber
        ? props.phone
        : new PhoneNumber(props.phone);
    this._address = props.address.trim();
    this._status = props.status || OperatorApplicationStatus.PENDING;
    this._rejectReason = props.rejectReason || null;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public static create(props: OperatorApplicationProps): OperatorApplication {
    return new OperatorApplication(props);
  }

  public static reconstruct(props: Required<OperatorApplicationProps>): OperatorApplication {
    return new OperatorApplication(props);
  }

  private validateUserId(userId: string): void {
    if (!userId || !userId.trim()) {
      throw new Error('Mã người dùng (userId) không được để trống.');
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      throw new Error('Tên nhà xe phải có độ dài từ 3 đến 100 ký tự.');
    }
  }

  private validateAddress(address: string): void {
    if (!address || !address.trim()) {
      throw new Error('Địa chỉ trụ sở nhà xe không được để trống.');
    }
  }

  public approve(): void {
    if (this._status !== OperatorApplicationStatus.PENDING) {
      throw new Error('Đơn đăng ký không ở trạng thái chờ duyệt (PENDING).');
    }
    this._status = OperatorApplicationStatus.APPROVED;
    this._updatedAt = new Date();
  }

  public reject(reason: string): void {
    if (this._status !== OperatorApplicationStatus.PENDING) {
      throw new Error('Đơn đăng ký không ở trạng thái chờ duyệt (PENDING).');
    }
    if (!reason || !reason.trim()) {
      throw new Error('Lý do từ chối không được để trống.');
    }
    this._status = OperatorApplicationStatus.REJECTED;
    this._rejectReason = reason.trim();
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get phone(): PhoneNumber {
    return this._phone;
  }

  get address(): string {
    return this._address;
  }

  get status(): OperatorApplicationStatus {
    return this._status;
  }

  get rejectReason(): string | null | undefined {
    return this._rejectReason;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
