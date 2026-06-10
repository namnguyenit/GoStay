

export const mediaRoutes = [
    // --- API Media (Cần xác thực bảo vệ rác / spam) ---
    {
        url: '/api/v1/media',
        target: (process.env.MEDIA_SERVICE_URL || "http://localhost:5001"),
        auth: true,
        pathRewrite: (path, req) => req.originalUrl.replace('/secure-document', '/secure-documents')
    },
    // --- API Communication tạm đặt trong Media Service ---
    {
        url: '/api/v1/communications',
        target: (process.env.MEDIA_SERVICE_URL || "http://localhost:5001"),
        auth: false,
        pathRewrite: (path, req) => req.originalUrl
    }
];
