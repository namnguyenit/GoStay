import { Test, TestingModule } from '@nestjs/testing';
import { LandmarkRepository } from './landmark.repository';
import { CATALOG_POOL } from '../../database/catalog-read.pool';

describe('LandmarkRepository', () => {
  let repository: LandmarkRepository;
  let mockPool: any;

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandmarkRepository,
        {
          provide: CATALOG_POOL,
          useValue: mockPool,
        },
      ],
    }).compile();

    repository = module.get<LandmarkRepository>(LandmarkRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('autocomplete', () => {
    it('should query the database with correct arguments', async () => {
      const mockResult = { rows: [{ id: '1', name: 'Thác Bản Giốc' }] };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await repository.autocomplete('Thac', 5);

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      const callArgs = mockPool.query.mock.calls[0];
      expect(callArgs[0]).toContain('gostay_normalize_search_text'); // SQL syntax check
      expect(callArgs[1]).toEqual(['Thac', 5]); // Params check
      expect(result).toEqual(mockResult.rows);
    });

    it('should query featured landmarks without trigram input', async () => {
      const mockResult = { rows: [{ id: '1', name: 'Phố cổ Hội An' }] };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await repository.findFeatured(6);

      const callArgs = mockPool.query.mock.calls[0];
      expect(callArgs[0]).toContain("lm.status = 'ACTIVE'");
      expect(callArgs[0]).toContain('COALESCE(lm.is_featured, false) DESC');
      expect(callArgs[0]).not.toContain('name_normalized %');
      expect(callArgs[1]).toEqual([6]);
      expect(result).toEqual(mockResult.rows);
    });
  });
});
