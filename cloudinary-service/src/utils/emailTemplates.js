const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const formatMoney = (value, currency = "VND") => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

const baseLayout = ({ title, preview, content }) => `
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview || title)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #e7ebf3;box-shadow:0 18px 45px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:28px 32px;background:#0ea5e9;color:#ffffff;">
                <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;">GoTravel</div>
                <div style="margin-top:6px;font-size:14px;opacity:0.9;">Du lịch, lưu trú và trải nghiệm trong một nền tảng</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6;">
                Email này được gửi tự động từ hệ thống GoTravel. Nếu bạn không thực hiện thao tác này, vui lòng bỏ qua email hoặc liên hệ bộ phận hỗ trợ.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const renderForgotPasswordEmail = ({ name, otp, resetUrl, expiresMinutes = 10 }) => {
    const safeName = escapeHtml(name || "bạn");
    const safeOtp = escapeHtml(otp || "");
    const safeResetUrl = escapeHtml(resetUrl || "");

    const actionBlock = resetUrl
        ? `<a href="${safeResetUrl}" style="display:inline-block;margin-top:20px;padding:13px 22px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;">Đặt lại mật khẩu</a>`
        : "";

    const otpBlock = otp
        ? `<div style="margin:22px 0;padding:18px 20px;border-radius:16px;background:#eff6ff;border:1px solid #bfdbfe;text-align:center;">
            <div style="font-size:13px;color:#475569;margin-bottom:8px;">Mã xác thực của bạn</div>
            <div style="font-size:34px;letter-spacing:8px;font-weight:800;color:#0f172a;">${safeOtp}</div>
          </div>`
        : "";

    return {
        subject: "GoTravel - Đặt lại mật khẩu",
        html: baseLayout({
            title: "Đặt lại mật khẩu GoTravel",
            preview: "Mã đặt lại mật khẩu GoTravel của bạn",
            content: `
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#0f172a;">Đặt lại mật khẩu</h1>
              <p style="margin:0 0 14px;color:#475569;line-height:1.7;">Xin chào ${safeName},</p>
              <p style="margin:0;color:#475569;line-height:1.7;">GoTravel nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mã này có hiệu lực trong <strong>${escapeHtml(expiresMinutes)} phút</strong>.</p>
              ${otpBlock}
              ${actionBlock}
            `,
        }),
    };
};

export const renderTicketEmail = ({
    customerName,
    orderNumber,
    orderId,
    items = [],
    totalAmount,
    currency = "VND",
    ticketUrl,
    qrImageUrl,
}) => {
    const rows = items.map((item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eef2f7;">
          <div style="font-weight:700;color:#0f172a;">${escapeHtml(item.listingTitle || "Dịch vụ GoTravel")}</div>
          <div style="margin-top:4px;color:#64748b;font-size:13px;">
            ${escapeHtml(item.startDate || "")}${item.endDate ? ` - ${escapeHtml(item.endDate)}` : ""} · SL: ${escapeHtml(item.quantity || 1)}
          </div>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #eef2f7;font-weight:700;color:#0f172a;">${formatMoney(item.totalPrice, currency)}</td>
      </tr>
    `).join("");

    const qrBlock = qrImageUrl
        ? `<div style="margin-top:22px;text-align:center;">
            <img src="${escapeHtml(qrImageUrl)}" alt="QR vé điện tử" style="width:168px;height:168px;border-radius:18px;border:1px solid #e2e8f0;" />
          </div>`
        : "";

    const ticketLink = ticketUrl
        ? `<a href="${escapeHtml(ticketUrl)}" style="display:inline-block;margin-top:20px;padding:13px 22px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;">Xem vé điện tử</a>`
        : "";

    return {
        subject: `GoTravel - Vé điện tử đơn ${orderNumber || orderId || ""}`.trim(),
        html: baseLayout({
            title: "Vé điện tử GoTravel",
            preview: "Vé điện tử cho đơn hàng GoTravel của bạn",
            content: `
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#0f172a;">Vé điện tử của bạn</h1>
              <p style="margin:0 0 18px;color:#475569;line-height:1.7;">Xin chào ${escapeHtml(customerName || "quý khách")}, đơn hàng của bạn đã thanh toán thành công.</p>
              <div style="padding:16px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;">
                <div style="font-size:13px;color:#64748b;">Mã đơn hàng</div>
                <div style="margin-top:4px;font-size:20px;font-weight:800;color:#0f172a;">${escapeHtml(orderNumber || orderId || "")}</div>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                ${rows || ""}
                <tr>
                  <td style="padding-top:16px;font-weight:800;color:#0f172a;">Tổng thanh toán</td>
                  <td align="right" style="padding-top:16px;font-weight:900;color:#e11d48;font-size:18px;">${formatMoney(totalAmount, currency)}</td>
                </tr>
              </table>
              ${qrBlock}
              ${ticketLink}
            `,
        }),
    };
};

export const renderRefundEmail = ({
    customerName,
    orderNumber,
    orderId,
    refundAmount,
    totalAmount,
    currency = "VND",
    reason,
    orderUrl,
    items = [],
}) => {
    const amount = refundAmount || totalAmount;
    const rows = items.map((item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f7;">
          <div style="font-weight:700;color:#0f172a;">${escapeHtml(item.listingTitle || "Dịch vụ GoTravel")}</div>
          <div style="margin-top:4px;color:#64748b;font-size:13px;">
            ${escapeHtml(item.startDate || "")}${item.endDate ? ` - ${escapeHtml(item.endDate)}` : ""} · SL: ${escapeHtml(item.quantity || 1)}
          </div>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #eef2f7;font-weight:700;color:#0f172a;">${formatMoney(item.totalPrice, currency)}</td>
      </tr>
    `).join("");

    const orderLink = orderUrl
        ? `<a href="${escapeHtml(orderUrl)}" style="display:inline-block;margin-top:20px;padding:13px 22px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;">Xem đơn hàng</a>`
        : "";

    return {
        subject: `GoTravel - Hoàn tiền thành công đơn ${orderNumber || orderId || ""}`.trim(),
        html: baseLayout({
            title: "Hoàn tiền thành công",
            preview: "GoTravel đã ghi nhận hoàn tiền cho đơn hàng của bạn",
            content: `
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#0f172a;">Hoàn tiền thành công</h1>
              <p style="margin:0 0 18px;color:#475569;line-height:1.7;">Xin chào ${escapeHtml(customerName || "quý khách")}, GoTravel đã ghi nhận hoàn tiền cho đơn hàng của bạn.</p>
              <div style="padding:16px;border-radius:16px;background:#ecfdf5;border:1px solid #bbf7d0;">
                <div style="font-size:13px;color:#047857;">Số tiền hoàn</div>
                <div style="margin-top:4px;font-size:26px;font-weight:900;color:#065f46;">${formatMoney(amount, currency)}</div>
                <div style="margin-top:8px;color:#475569;font-size:13px;">Mã đơn hàng: <strong>${escapeHtml(orderNumber || orderId || "")}</strong></div>
              </div>
              ${reason ? `<div style="margin-top:16px;padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;line-height:1.6;"><strong>Lý do:</strong> ${escapeHtml(reason)}</div>` : ""}
              ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">${rows}</table>` : ""}
              <p style="margin:18px 0 0;color:#64748b;line-height:1.7;font-size:14px;">Tùy ngân hàng hoặc phương thức thanh toán, tiền có thể cần thêm thời gian để hiển thị trong tài khoản của bạn.</p>
              ${orderLink}
            `,
        }),
    };
};
