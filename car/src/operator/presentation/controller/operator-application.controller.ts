import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateOperatorApplicationDto } from '../dto/create-operator-application.dto';
import { ProcessOperatorApplicationDto } from '../dto/process-operator-application.dto';
import type { ICreateOperatorApplicationUseCase } from '../../application/port/create-operator-application.usecase.interface';
import type { IProcessOperatorApplicationUseCase } from '../../application/port/process-operator-application.usecase.interface';
import type { IGetOperatorApplicationsUseCase } from '../../application/port/get-operator-applications.usecase.interface';
import { OperatorApplicationPresentationMapper } from '../mapper/operator-application-presentation.mapper';
import { OperatorApplicationStatus } from '../../domain/value-object/operator-application-status.enum';

@Controller('operator-applications')
export class OperatorApplicationController {
  constructor(
    @Inject('ICreateOperatorApplicationUseCase')
    private readonly createApplicationUseCase: ICreateOperatorApplicationUseCase,
    @Inject('IProcessOperatorApplicationUseCase')
    private readonly processApplicationUseCase: IProcessOperatorApplicationUseCase,
    @Inject('IGetOperatorApplicationsUseCase')
    private readonly getApplicationsUseCase: IGetOperatorApplicationsUseCase,
  ) {}

  private checkAdminRole(userRoles?: string): void {
    if (!userRoles || !userRoles.toUpperCase().includes('ADMIN')) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện thao tác này. Chỉ Quản trị viên (Admin) mới có quyền truy cập.',
      );
    }
  }

  /**
   * User nộp đơn xin làm Nhà xe (Bất kỳ người dùng đã đăng nhập nào cũng được gửi đơn)
   */
  @Post()
  async requestOperator(
    @Body() dto: CreateOperatorApplicationDto,
    @Headers('x-user-id') headerUserId?: string,
    @Body('userId') bodyUserId?: string,
  ) {
    const userId = headerUserId || bodyUserId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin định danh người dùng (x-user-id header).');
    }

    const input = OperatorApplicationPresentationMapper.toInput(dto, userId);
    const result = await this.createApplicationUseCase.execute(input);
    return OperatorApplicationPresentationMapper.toCreateApiResponse(result);
  }

  /**
   * Admin xem danh sách các đơn đăng ký (Chỉ Admin mới có quyền xem)
   */
  @Get()
  async getApplications(
    @Query('status') status?: OperatorApplicationStatus,
    @Headers('x-user-roles') userRoles?: string,
  ) {
    this.checkAdminRole(userRoles);

    const list = await this.getApplicationsUseCase.execute(status);
    return OperatorApplicationPresentationMapper.toListApiResponse(list);
  }

  /**
   * Admin xử lý duyệt / từ chối đơn đăng ký (Chỉ Admin mới có quyền)
   */
  @Patch(':id/process')
  async processApplication(
    @Param('id') id: string,
    @Body() dto: ProcessOperatorApplicationDto,
    @Headers('x-user-roles') userRoles?: string,
  ) {
    this.checkAdminRole(userRoles);

    const result = await this.processApplicationUseCase.execute({
      applicationId: id,
      status: dto.status,
      rejectReason: dto.rejectReason,
    });
    return OperatorApplicationPresentationMapper.toProcessApiResponse(result);
  }

  /**
   * Helper endpoint: Phê duyệt nhanh đơn đăng ký
   */
  @Patch(':id/approve')
  async approveApplication(
    @Param('id') id: string,
    @Headers('x-user-roles') userRoles?: string,
  ) {
    this.checkAdminRole(userRoles);

    const result = await this.processApplicationUseCase.execute({
      applicationId: id,
      status: OperatorApplicationStatus.APPROVED,
    });
    return OperatorApplicationPresentationMapper.toProcessApiResponse(result);
  }

  /**
   * Helper endpoint: Từ chối nhanh đơn đăng ký
   */
  @Patch(':id/reject')
  async rejectApplication(
    @Param('id') id: string,
    @Body('rejectReason') rejectReason?: string,
    @Body('reason') reason?: string,
    @Headers('x-user-roles') userRoles?: string,
  ) {
    this.checkAdminRole(userRoles);

    const result = await this.processApplicationUseCase.execute({
      applicationId: id,
      status: OperatorApplicationStatus.REJECTED,
      rejectReason: rejectReason || reason,
    });
    return OperatorApplicationPresentationMapper.toProcessApiResponse(result);
  }
}
