import { Test, TestingModule } from '@nestjs/testing';
import { ListingRepository } from './listing.repository';
import { CATALOG_POOL } from '../../database/catalog-read.pool';

describe('ListingRepository', () => {
  let repository: ListingRepository;
  let mockPool: any;

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingRepository,
        {
          provide: CATALOG_POOL,
          useValue: mockPool,
        },
      ],
    }).compile();

    repository = module.get<ListingRepository>(ListingRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findNearby', () => {
    it('should query the database with ALL category', async () => {
      const mockResult = { rows: [] };
      mockPool.query.mockResolvedValueOnce(mockResult);

      await repository.findNearby({ lat: 10, lng: 20, radiusMeters: 5000, category: 'ALL', limit: 10, offset: 0 });

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      const callArgs = mockPool.query.mock.calls[0];
      expect(callArgs[0]).toContain('ST_DWithin');
      expect(callArgs[1]).toEqual([20, 10, 5000, 10, 0]); // params check
    });

    it('should query the database with specific category', async () => {
      const mockResult = { rows: [] };
      mockPool.query.mockResolvedValueOnce(mockResult);

      await repository.findNearby({ lat: 10, lng: 20, radiusMeters: 5000, category: 'STAY', limit: 10, offset: 0 });

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      const callArgs = mockPool.query.mock.calls[0];
      expect(callArgs[0]).toContain('l.category = $4');
      expect(callArgs[1]).toEqual([20, 10, 5000, 'STAY', 10, 0]); // params check
    });

    it('should query keyword search using normalized listing title', async () => {
      const mockResult = { rows: [] };
      mockPool.query.mockResolvedValueOnce(mockResult);

      await repository.search({ q: 'Thac Ban Gioc', category: 'ALL', limit: 10, offset: 0 });

      const callArgs = mockPool.query.mock.calls[0];
      expect(callArgs[0]).toContain('gostay_normalize_search_text');
      expect(callArgs[0]).toContain('l.title_normalized');
      expect(callArgs[0]).toContain('"textScore"');
      expect(callArgs[1]).toEqual(['Thac Ban Gioc', 10, 0]);
    });
  });
});
