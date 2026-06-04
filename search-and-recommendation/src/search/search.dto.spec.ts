import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CategoryMode, SearchQueryDto, SortMode } from './search.dto';

describe('SearchQueryDto', () => {
  it('should parse valid DTO correctly', async () => {
    const rawData = {
      q: 'Hanoi',
      category: 'STAY',
      lat: '21.0285',
      lng: '105.8542',
      radiusMeters: '1000',
      guests: '2',
      limit: '10',
      minPrice: '500000',
      sortBy: 'PRICE_ASC'
    };

    const dto = plainToInstance(SearchQueryDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.category).toBe(CategoryMode.STAY);
    expect(dto.lat).toBe(21.0285);
    expect(dto.lng).toBe(105.8542);
    expect(dto.radiusMeters).toBe(1000);
    expect(dto.guests).toBe(2);
    expect(dto.limit).toBe(10);
    expect(dto.minPrice).toBe(500000);
    expect(dto.sortBy).toBe(SortMode.PRICE_ASC);
  });

  it('should fail validation for invalid coordinates', async () => {
    const rawData = {
      lat: '900', // Invalid lat
      lng: '105.8542'
    };

    const dto = plainToInstance(SearchQueryDto, rawData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const latError = errors.find(e => e.property === 'lat');
    expect(latError).toBeDefined();
  });
});
