export const identityRoutes = [
    // --- Lấy Public Key (Không Auth) ---
    {
        url: '/.well-known/jwks.json',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false
    },
    // --- Nhóm Auth / Đăng nhập, Đăng ký (Từ Frontend map sang Backend) ---
    {
        url: '/api/v1/auth',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false,
        pathRewrite: {
            '^/api/v1/auth/login': '/api/auth/login',
            '^/api/v1/auth/register/user': '/api/users', // Backend: POST /api/users
            '^/api/v1/auth/register/host': '/api/auth/register-host-not-implemented' // Backend code chưa hỗ trợ đăng ký host không cần auth
        }
    },
    // --- Internal Status Check ---
    {
        url: '/api/v1/users/internal',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false,
        pathRewrite: {
            '^/api/v1/users/internal': '/api/users/internal'
        }
    },
    // --- Nhóm User (ROLE: USER) ---
    {
        url: '/api/v1/users/me',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true,
        pathRewrite: {
            '^/api/v1/users/me': '/api/users/me'
        }
    },
    // --- Nhóm Host (ROLE: HOST) ---
    {
        url: '/api/v1/hosts/me',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true,
        pathRewrite: {
            '^/api/v1/hosts/me': '/api/users/me/host-profile'  // Backend: GET /api/users/me/host-profile
        }
    },
    // --- Nhóm Admin (ROLE: ADMIN) ---
    {
        url: '/api/v1/admin',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true,
        pathRewrite: {
            // Cần dấu '$' hoặc cấu trúc regex chặt chẽ để không bị ghi đè nhầm (từ chi tiết tới tổng quát)
            '^/api/v1/admin/hosts/([a-zA-Z0-9_-]+)/approval-status$': '/api/users/$1/approvalstatus',
            '^/api/v1/admin/accounts/([a-zA-Z0-9_-]+)/status$': '/api/users/accounts/$1/status',
            '^/api/v1/admin/hosts/([a-zA-Z0-9_-]+)$': '/api/users/hosts/$1',
            '^/api/v1/admin/hosts': '/api/users/hosts'
        }
    },

    // =========================================================================
    // PHẦN BỔ SUNG: CÁC API THEO CODE BACKEND CHƯA ĐƯỢC FRONTEND DOCUMENT
    // Cho phép gọi thẳng qua Native URL của Identity /api/users/... 
    // =========================================================================
    
    // Check Internal (Native Endpoint)
    {
        url: '/api/users/internal',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false
    },
    // Các endpoint của Nhóm Tài Khoản Cá Nhân (Hồ sơ, Upgrade lên Doanh Nghiệp / Host, Xóa hồ sơ...)
    {
        url: '/api/users/me', 
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true
    },
    // Các endpoint của Admin quản lý Host List
    {
        url: '/api/users/hosts',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true
    },
    // Quản trị viên (Khóa, xóa cứng Admin)
    {
        url: '/api/users/admin',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true
    },
    // Quản lý status tài khoản
    {
        url: '/api/users/accounts',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true
    },
    // --- Tránh lọt qua auth: false của /api/users bằng cách bắt URL Pattern ---
    {
        url: '/api/users/*/approvalstatus',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true
    },
    {
        url: '/api/users/*/upgraderole',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true
    },
    {
        url: '/api/users/*/successupgradetohost',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true
    },
    // --- GET All Users & Đăng Ký (POST /api/users) (Gateway thả rông, Spring phân quyền) ---
    {
        url: '/api/users',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false
    }
];