import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

export class ProcessOperatorApplicationDto {
  @IsNotEmpty({ message: 'Trạng thái xử lý không được để trống.' })
  @IsIn([OperatorApplicationStatus.APPROVED, OperatorApplicationStatus.REJECTED], {
    message: 'Trạng thái phải là APPROVED hoặc REJECTED.',
  })
  status: OperatorApplicationStatus.APPROVED | OperatorApplicationStatus.REJECTED;

  @IsOptional()
  @IsString({ message: 'Lý do từ chối phải là chuỗi ký tự.' })
  rejectReason?: string;
}
