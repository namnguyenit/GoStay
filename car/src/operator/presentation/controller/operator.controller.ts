import {
  Controller,
  Get,
  Query,
  Headers,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { GetOperatorsQueryDto } from '../dto/get-operators-query.dto';
import type { IGetOperatorsUseCase } from '../../application/port/get-operators.usecase.interface';
import { OperatorPresentationMapper } from '../mapper/operator-presentation.mapper';

@Controller('operators')
export class OperatorController {
  constructor(
    @Inject('IGetOperatorsUseCase')
    private readonly getOperatorsUseCase: IGetOperatorsUseCase,
  ) {}

  private checkAdminRole(userRoles?: string): void {
    if (!userRoles || !userRoles.toUpperCase().includes('ADMIN')) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện thao tác này. Chỉ Quản trị viên (Admin) mới có quyền truy cập.',
      );
    }
  }

  /**
   * Quản trị viên xem danh sách các Nhà xe chính thức trên hệ thống
   */
  @Get()
  async getOperators(
    @Query() query: GetOperatorsQueryDto,
    @Headers('x-user-roles') userRoles?: string,
  ) {
    this.checkAdminRole(userRoles);

    const input = OperatorPresentationMapper.toGetOperatorsInput(query);
    const result = await this.getOperatorsUseCase.execute(input);
    return OperatorPresentationMapper.toGetOperatorsApiResponse(result);
  }
}
