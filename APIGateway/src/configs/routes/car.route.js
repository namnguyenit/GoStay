/**
 * ============================================================================
 * CAR SERVICE - Route Configuration
 * Backend Port: 3333
 * ============================================================================
 */

export const carRoutes = [
    {
        url: '/api/v1/cars',
        target: (process.env.CAR_SERVICE_URL || "http://localhost:3333"),
        auth: true, // Yêu cầu JWT Token (verifyUser & đính kèm header x-user-id)
        pathRewrite: (path, req) => {
            const parts = req.originalUrl.split('?');
            let url = parts[0];
            const query = parts[1] ? `?${parts[1]}` : '';

            // Rewrite /api/v1/cars -> /cars
            url = url.replace(/^\/api\/v1\/cars/, '/cars');

            return url + query;
        }
    }
];
