export class PhoneNumber {
  private readonly value: string;

  constructor(phone: string) {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Số điện thoại không được để trống.');
    }

    const trimmed = phone.trim();
    if (!this.isValidVietnamesePhone(trimmed)) {
      throw new Error(`Số điện thoại "${phone}" không hợp lệ (phải là định dạng SĐT Việt Nam 10 chữ số).`);
    }

    this.value = trimmed;
  }

  private isValidVietnamesePhone(phone: string): boolean {
    const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return regex.test(phone);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: PhoneNumber): boolean {
    return this.value === other.getValue();
  }
}
