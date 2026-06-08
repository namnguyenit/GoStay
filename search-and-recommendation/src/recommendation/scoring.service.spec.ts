import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  let scoringService: ScoringService;

  beforeEach(() => {
    scoringService = new ScoringService();
  });

  it('should score candidates based on geo distance correctly', () => {
    const candidates = [
      { id: '1', distanceMeters: 0 }, // max geo score (30)
      { id: '2', distanceMeters: 5000 }, // mid geo score (15)
      { id: '3', distanceMeters: 10000 }, // min geo score (0)
      { id: '4', distanceMeters: 20000 }, // beyond max dist (0)
    ];

    const result = scoringService.score(candidates, {});

    expect(result[0].finalScore).toBeCloseTo(30); // 0.3 * 100
    expect(result[1].finalScore).toBeCloseTo(15); // 0.3 * 50
    expect(result[2].finalScore).toBeCloseTo(0);
    expect(result[3].finalScore).toBeCloseTo(0);
  });

  it('should apply category boost', () => {
    const candidates = [
      { id: '1', category: 'STAY' },
      { id: '2', category: 'EXP' },
    ];

    const result = scoringService.score(candidates, { targetCategory: 'STAY' });

    expect(result[0].finalScore).toBeCloseTo(20); // 0.20 * 100
    expect(result[1].finalScore).toBeCloseTo(0);
  });

  it('should apply rating and popularity scores with penalty for low reviews', () => {
    const candidates = [
      { id: '1', averageRating: 5.0, totalReviews: 100 }, // perfect score
      { id: '2', averageRating: 5.0, totalReviews: 2 }, // penalty applied for low reviews
    ];

    const result = scoringService.score(candidates, {});

    // Rating: 0.15 * (5/5)*100 * 1.0 = 15
    // Pop: 0.10 * 100 = 10
    // Total: 25
    expect(result[0].finalScore).toBeCloseTo(25);

    // Rating: 0.15 * (5/5)*100 * 0.8 = 12
    // Pop: 0.10 * 2 = 0.2
    // Total: 12.2
    expect(result[1].finalScore).toBeCloseTo(12.2);
  });

  it('should apply complex boost', () => {
    const candidates = [
      { id: '1', complex_id: 'C1' },
      { id: '2', complex_id: 'C2' },
    ];

    const result = scoringService.score(candidates, { complexId: 'C1' });

    expect(result[0].finalScore).toBeCloseTo(5); // 0.05 * 100
    expect(result[1].finalScore).toBeCloseTo(0);
  });
});
