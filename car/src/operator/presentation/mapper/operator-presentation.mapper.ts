import { GetOperatorsQueryDto } from '../dto/get-operators-query.dto';
import { GetOperatorsInput } from '../../application/dto/get-operators.input';
import { GetOperatorsOutput } from '../../application/dto/get-operators.output';

export class OperatorPresentationMapper {
  public static toGetOperatorsInput(query: GetOperatorsQueryDto): GetOperatorsInput {
    return {
      search: query.search,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };
  }

  public static toGetOperatorsApiResponse(output: GetOperatorsOutput) {
    return {
      success: true,
      code: 'GET_OPERATORS_SUCCESS',
      message: 'Lấy danh sách nhà xe thành công.',
      data: output.data,
      pagination: output.pagination,
    };
  }
}
