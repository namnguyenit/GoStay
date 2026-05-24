

export const mediaRoutes = [
    // --- API Media (Cần xác thực bảo vệ rác / spam) ---
    {
        url: '/api/v1/media',
        target: (process.env.MEDIA_SERVICE_URL || "http://localhost:5001"),
        auth: true,
        pathRewrite: {
            // Frontend truyền 'secure-document' (số ít) nhưng backend code định nghĩa 'secure-documents'
            '^/api/v1/media/upload/secure-document$': '/api/v1/media/upload/secure-documents'
        }
    }
];
