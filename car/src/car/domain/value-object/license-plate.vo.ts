export class LicensePlate {
  private readonly value: string;

  constructor(plate: string) {
    if (!plate || typeof plate !== 'string') {
      throw new Error('Biển số xe không được để trống.');
    }

    const trimmed = plate.trim().toUpperCase();
    if (!this.isValidFormat(trimmed)) {
      throw new Error(`Biển số xe "${plate}" không đúng định dạng biển số xe Việt Nam (VD: 51B-123.45, 29B-98765).`);
    }

    this.value = trimmed;
  }

  private isValidFormat(plate: string): boolean {
    // Regex hỗ trợ định dạng biển số xe Việt Nam (VD: 51B-123.45, 29B-12345, 43B-012.34)
    const regex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{3,5}(\.[0-9]{2})?$/;
    return regex.test(plate);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: LicensePlate): boolean {
    return this.value === other.getValue();
  }
}
