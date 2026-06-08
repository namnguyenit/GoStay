# Catalog API Boundary Contract

## Java Spring Boot - Catalog & Listing Service

Java owns the write side and minimal catalog reads:

- Create/update/hide listings, landmarks, complexes, reviews, and landmark suggestions.
- Return listing detail by id.
- Return simple public landmark data for display.
- Maintain database fields needed by Node.js, including `location`, normalized search text, rating aggregates, category/subCategory, and attributes.

Java must not own advanced public search behavior:

- No public nearby/radius endpoint.
- No public autocomplete ranking.
- No public keyword relevance ranking.
- No map/bounding-box search.
- No recommendation query/ranking.

## Node.js - Search & Location Service

Node.js owns the read/query side for search experiences:

- Landmark autocomplete using `landmarks.name_normalized`.
- Listing keyword search using `listings.title_normalized`.
- Nearby search by landmark or coordinate using `location::geography`.
- Map/bounding-box search and location filters.
- Search ranking and result grouping.

Node.js must connect with the read-only database user `catalog_node_reader`.

## Node.js - Recommendation Engine

Node.js owns recommendation ranking:

- Suggested listings near a landmark or trip context.
- Ranking by distance, category, rating, popularity, and future behavioral signals.
- Grouping or boosting listings by complex/ecosystem.

## Removed From Java

The Java endpoint `GET /api/v1/catalog/listings/landmarks/{landmarkId}/nearby`
and its `ST_DWithin` repository query were removed to avoid two public sources
of nearby/radius search truth.

The Java endpoint `GET /api/v1/catalog/listings` was also removed from the
public API because category/province filtering and public listing result ranking
belong to the Node.js Search & Location Service. Admin and host listing views
remain in Java because they are management views, not public search.
