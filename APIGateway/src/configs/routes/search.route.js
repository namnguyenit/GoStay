export const searchRoutes = [
    {
        url: '/api/v1/search',
        target: (process.env.SEARCH_SERVICE_URL || "http://localhost:8086"),
        auth: false,
    },
    {
        url: '/api/v1/recommendations',
        target: (process.env.SEARCH_SERVICE_URL || "http://localhost:8086"),
        auth: false,
    },
    {
        url: '/api/v1/behaviors',
        target: (process.env.SEARCH_SERVICE_URL || "http://localhost:8086"),
        auth: false,
    }
];
