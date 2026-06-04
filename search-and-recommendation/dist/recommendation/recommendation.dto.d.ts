import { CategoryMode } from '../search/search.dto';
export declare class CrossSellRequestDto {
    sourceListingId: string;
    sourceCategory: string;
    checkIn: string;
    checkOut: string;
    guests?: number;
    cartListingIds?: string[];
    limit?: number;
}
export declare class HomeFeedQueryDto {
    lat?: number;
    lng?: number;
    category?: CategoryMode;
    cursor?: string;
}
export declare class NearbyRecommendationQueryDto {
    lat: number;
    lng: number;
    category?: CategoryMode;
}
