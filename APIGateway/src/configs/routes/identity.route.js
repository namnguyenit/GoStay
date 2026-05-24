import { authRateLimiters } from "../../middlewares/auth-rate-limit.middleware.js";

export const identityRoutes = [
    // ==========================================
    // 1. JWKS (Public - Không Auth)
    // ==========================================
    {
        url: '/.well-known/jwks.json',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false
    },

    // ==========================================
    // 2. NHÓM AUTH (Đăng nhập, Đăng ký)
    // ==========================================
    {
        url: '/api/v1/auth',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false,
        middlewares: authRateLimiters,
        pathRewrite: (path, req) => {
            const parts = req.originalUrl.split('?');
            let url = parts[0];
            const query = parts[1] ? `?${parts[1]}` : '';

            // Phiên dịch URL từ Frontend sang Backend
            if (url === '/api/v1/auth/login') return '/api/auth/login' + query;
            if (url === '/api/v1/auth/register') return '/api/users' + query; // Nối vào @PostMapping("/api/users")

            return path;
        }
    },

    // ==========================================
    // 3. NHÓM CÁ NHÂN (Tiền tố: /api/v1/me)
    // Bao gồm User, Host, Enterprise xem hồ sơ của chính mình
    // ==========================================
    {
        url: '/api/v1/me',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true,
        pathRewrite: (path, req) => {
            const parts = req.originalUrl.split('?');
            let url = parts[0];
            const query = parts[1] ? `?${parts[1]}` : '';

            // Dùng Regex để bắt và phiên dịch URL
            url = url.replace(/^\/api\/v1\/me\/?$/, '/api/users/me'); // GET, PUT Thông tin tài khoản
            url = url.replace(/^\/api\/v1\/me\/profile$/, '/api/users/me/profile'); // GET, PUT Hồ sơ User
            url = url.replace(/^\/api\/v1\/me\/avatar$/, '/api/users/me/avatar'); // POST Upload Avatar

            // Cập nhật lên Host / Enterprise
            url = url.replace(/^\/api\/v1\/me\/upgrade-host$/, '/api/users/me/upgradetohost');
            url = url.replace(/^\/api\/v1\/me\/upgrade-enterprise$/, '/api/users/me/upgradetoenterprise');

            // Lấy hồ sơ đặc thù
            url = url.replace(/^\/api\/v1\/me\/host-profile$/, '/api/users/me/host-profile');
            url = url.replace(/^\/api\/v1\/me\/enterprise-profile$/, '/api/users/me/enterprise-profile');

            return url + query;
        }
    },

    // ==========================================
    // 4. NHÓM ADMIN (Tiền tố: /api/v1/admin)
    // ==========================================
    {
        url: '/api/v1/admin',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: true,
        pathRewrite: (path, req) => {
            const parts = req.originalUrl.split('?');
            let url = parts[0];
            const query = parts[1] ? `?${parts[1]}` : '';

            // --- Quản lý Users ---
            url = url.replace(/^\/api\/v1\/admin\/applications\/?$/, '/api/users/admin/applications');
            url = url.replace(/^\/api\/v1\/admin\/applications\/([^\/]+)\/approve$/, '/api/users/admin/applications/$1/approve');
            url = url.replace(/^\/api\/v1\/admin\/applications\/([^\/]+)\/reject$/, '/api/users/admin/applications/$1/reject');
            url = url.replace(/^\/api\/v1\/admin\/applications\/([^\/]+)$/, '/api/users/admin/applications/$1');
            url = url.replace(/^\/api\/v1\/admin\/users\/?$/, '/api/users'); // GET All Users
            url = url.replace(/^\/api\/v1\/admin\/users\/([^\/]+)$/, '/api/users/admin/$1'); // DELETE, PATCH user
            url = url.replace(/^\/api\/v1\/admin\/users\/([^\/]+)\/role$/, '/api/users/$1/upgraderole');
            url = url.replace(/^\/api\/v1\/admin\/accounts\/([^\/]+)\/status$/, '/api/users/accounts/$1/status');

            // --- Quản lý Hosts ---
            url = url.replace(/^\/api\/v1\/admin\/hosts\/?$/, '/api/users/hosts'); // GET Host Pending
            url = url.replace(/^\/api\/v1\/admin\/hosts\/all$/, '/api/users/hosts/all'); // GET All Hosts
            url = url.replace(/^\/api\/v1\/admin\/hosts\/([^\/]+)$/, '/api/users/hosts/$1'); // Lấy Host Detail
            url = url.replace(/^\/api\/v1\/admin\/hosts\/([^\/]+)\/approval$/, '/api/users/$1/approvalstatus');
            url = url.replace(/^\/api\/v1\/admin\/hosts\/([^\/]+)\/success$/, '/api/users/$1/successupgradetohost');

            return url + query;
        }
    },
    // ==========================================
    // 5. NHÓM INTERNAL (Chỉ dùng nội bộ - Không Auth)
    // ==========================================
    {
        url: '/api/v1/internal',
        target: process.env.IDENTITY_SERVICE_URL,
        auth: false,
        pathRewrite: (path, req) => {
            const parts = req.originalUrl.split('?');
            let url = parts[0];
            const query = parts[1] ? `?${parts[1]}` : '';

            // Map từ /api/v1/internal/users/{id}/status sang Backend
            url = url.replace(/^\/api\/v1\/internal\/users\/([^\/]+)\/status$/, '/api/users/internal/$1/status');
            
            return url + query;
        }
    }
];
