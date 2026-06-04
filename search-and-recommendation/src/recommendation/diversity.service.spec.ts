import { DiversityService } from './diversity.service';

describe('DiversityService', () => {
  let service: DiversityService;

  beforeEach(() => {
    service = new DiversityService();
  });

  it('limits repeated hosts before backfilling lower ranked items', () => {
    const result = service.diversifyAndRank(
      [
        { id: '1', host_id: 'H1', finalScore: 100 },
        { id: '2', host_id: 'H1', finalScore: 99 },
        { id: '3', host_id: 'H1', finalScore: 98 },
        { id: '4', host_id: 'H2', finalScore: 80 },
      ],
      3,
    );

    expect(result.map((item) => item.id)).toEqual(['1', '2', '4']);
  });

  it('backfills when diversity limits would otherwise return fewer than requested', () => {
    const result = service.diversifyAndRank(
      [
        { id: '1', host_id: 'H1', finalScore: 100 },
        { id: '2', host_id: 'H1', finalScore: 99 },
        { id: '3', host_id: 'H1', finalScore: 98 },
      ],
      3,
    );

    expect(result.map((item) => item.id)).toEqual(['1', '2', '3']);
  });
});
