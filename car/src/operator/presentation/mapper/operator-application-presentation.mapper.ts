import { CreateOperatorApplicationDto } from '../dto/create-operator-application.dto';
import { CreateOperatorApplicationInput } from '../../application/dto/create-operator-application.input';
import { OperatorApplicationOutput } from '../../application/dto/operator-application.output';
import { ProcessOperatorApplicationResult } from '../../application/port/process-operator-application.usecase.interface';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

export class OperatorApplicationPresentationMapper {
  public static toInput(dto: CreateOperatorApplicationDto, userId: string): CreateOperatorApplicationInput {
    return {
      userId,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
    };
  }

  public static toCreateApiResponse(output: OperatorApplicationOutput) {
    return {
      success: true,
      code: 'REQUEST_OPERATOR_SUCCESS',
      message: 'Gửi đơn đăng ký thành công! Yêu cầu của bạn đang chờ Admin xem xét và phê duyệt.',
      data: output,
    };
  }

  public static toProcessApiResponse(result: ProcessOperatorApplicationResult) {
    const isApproved = result.application.status === OperatorApplicationStatus.APPROVED;

    return {
      success: true,
      code: isApproved ? 'APPROVE_OPERATOR_SUCCESS' : 'REJECT_OPERATOR_SUCCESS',
      message: isApproved
        ? 'Đã phê duyệt đơn đăng ký nhà xe thành công!'
        : 'Đã từ chối đơn đăng ký nhà xe.',
      data: {
        application: result.application,
        operator: result.operator || null,
      },
    };
  }

  public static toListApiResponse(list: OperatorApplicationOutput[]) {
    return {
      success: true,
      code: 'GET_OPERATOR_APPLICATIONS_SUCCESS',
      message: 'Lấy danh sách đơn đăng ký thành công.',
      data: list,
    };
  }
}
