export declare enum CategoryMode {
    ALL = "ALL",
    STAY = "STAY",
    EXP = "EXP",
    SVC = "SVC"
}
export declare enum SortMode {
    DISTANCE = "DISTANCE",
    RATING = "RATING",
    PRICE_ASC = "PRICE_ASC",
    PRICE_DESC = "PRICE_DESC",
    RELEVANCE = "RELEVANCE"
}
export declare class SearchQueryDto {
    q?: string;
    locationQuery?: string;
    landmarkId?: string;
    category?: CategoryMode;
    subCategory?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    lat?: number;
    lng?: number;
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
    radiusMeters?: number;
    limit?: number;
    offset?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    amenities?: string;
    sortBy?: SortMode;
}
