import Link from "next/link";
import { AlertTriangle, CheckCircle2, HelpCircle, MessageSquareWarning, ShieldCheck } from "lucide-react";

type SupportContentPageProps = {
  variant: "help" | "policy" | "report";
};

const pageContent = {
  help: {
    eyebrow: "Trung tâm trợ giúp",
    title: "Chúng tôi có thể hỗ trợ gì cho bạn?",
    description:
      "Tìm hướng dẫn đặt dịch vụ, thanh toán, nhận vé điện tử, quản lý đơn hàng và xử lý các tình huống phát sinh trên GoTravel.",
    icon: HelpCircle,
    sections: [
      {
        title: "Đặt dịch vụ và thanh toán",
        items: [
          "Chọn nơi lưu trú, trải nghiệm, dịch vụ hoặc khu tổ hợp phù hợp.",
          "Kiểm tra lại thông tin khách, ngày sử dụng và tổng thanh toán trước khi trả tiền.",
          "Sau khi thanh toán thành công, vé check-in sẽ nằm trong mục Đơn hàng đã hoàn tất.",
        ],
      },
      {
        title: "Dành cho Host và Doanh nghiệp",
        items: [
          "Quản lý dịch vụ, lịch nhận khách, khả dụng và đơn hàng trong kênh riêng.",
          "Cập nhật tài khoản nhận tiền tại mục Tài khoản nhận tiền.",
          "Theo dõi doanh thu và trạng thái payout trong trang Thu nhập.",
        ],
      },
      {
        title: "Cần hỗ trợ thêm",
        items: [
          "Nếu dịch vụ không đúng mô tả, hãy gửi khiếu nại từ đơn hàng hoàn tất.",
          "Nếu phát hiện nội dung sai hoặc vấn đề vận hành, dùng trang Báo cáo vấn đề.",
        ],
      },
    ],
  },
  policy: {
    eyebrow: "Chính sách hủy",
    title: "Quy định hủy đơn và hoàn tiền",
    description:
      "Chính sách này giúp khách, host và doanh nghiệp hiểu rõ khi nào đơn có thể hủy, khi nào cần admin xử lý tranh chấp hoặc hoàn tiền.",
    icon: ShieldCheck,
    sections: [
      {
        title: "Trước khi thanh toán",
        items: [
          "Bạn có thể bỏ dịch vụ khỏi giỏ hàng hoặc quay lại chỉnh thông tin mà không phát sinh phí.",
          "Các giữ chỗ tạm thời sẽ hết hạn nếu không hoàn tất thanh toán đúng thời gian.",
        ],
      },
      {
        title: "Sau khi thanh toán",
        items: [
          "Đơn đã xác nhận có thể cần host/doanh nghiệp hoặc admin kiểm tra trước khi hủy.",
          "Nếu dịch vụ không thể cung cấp, admin có thể force cancel và ghi nhận hoàn tiền theo trạng thái thanh toán.",
          "Thời gian tiền về phụ thuộc cổng thanh toán/ngân hàng xử lý giao dịch.",
        ],
      },
      {
        title: "Tranh chấp",
        items: [
          "Khách nên gửi khiếu nại kèm mô tả rõ ràng và bằng chứng nếu có.",
          "Admin sẽ kiểm tra đơn hàng, phản hồi và xử lý refund nếu đủ điều kiện.",
        ],
      },
    ],
  },
  report: {
    eyebrow: "Báo cáo vấn đề",
    title: "Gửi báo cáo để GoTravel kiểm tra",
    description:
      "Dùng trang này khi bạn phát hiện dịch vụ sai thông tin, hình ảnh không phù hợp, vấn đề thanh toán hoặc hành vi vi phạm.",
    icon: MessageSquareWarning,
    sections: [
      {
        title: "Các vấn đề nên báo cáo",
        items: [
          "Thông tin dịch vụ, địa chỉ, giá hoặc hình ảnh không đúng thực tế.",
          "Host/doanh nghiệp không phản hồi hoặc không cung cấp dịch vụ đã thanh toán.",
          "Nội dung vi phạm, spam hoặc hành vi gây rủi ro cho khách hàng.",
        ],
      },
      {
        title: "Cách gửi nhanh nhất",
        items: [
          "Với đơn đã thanh toán, vào Đơn hàng đã hoàn tất và bấm Khiếu nại để gắn đúng mã đơn.",
          "Với vấn đề chung, gửi mô tả qua biểu mẫu bên dưới để đội vận hành kiểm tra.",
        ],
      },
    ],
  },
} as const;

export default function SupportContentPage({ variant }: SupportContentPageProps) {
  const content = pageContent[variant];
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-white px-4 pb-16 pt-10 text-[#222222]">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] border border-zinc-200 bg-gradient-to-br from-sky-50 via-white to-white p-6 shadow-sm md:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
            <Icon className="h-4 w-4" />
            {content.eyebrow}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{content.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">{content.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/orders/completed"
              className="rounded-full bg-[#222222] px-5 py-3 text-sm font-bold text-white transition hover:bg-black"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/disputes"
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-900 transition hover:border-zinc-900"
            >
              Khiếu nại của tôi
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {content.sections.map((section) => (
            <section key={section.title} className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-zinc-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {variant === "report" && (
          <section className="mt-8 rounded-[28px] border border-rose-100 bg-rose-50 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <h2 className="text-lg font-bold text-rose-950">Biểu mẫu báo cáo nhanh</h2>
                <p className="mt-2 text-sm leading-6 text-rose-800">
                  Hiện hệ thống đã có luồng khiếu nại theo đơn hàng. Nếu cần báo cáo ngoài đơn hàng, vui lòng dùng mô tả rõ mã dịch vụ, tên host/doanh nghiệp và vấn đề gặp phải. Phase tiếp theo có thể nối biểu mẫu này vào backend report riêng.
                </p>
                <Link
                  href="/disputes"
                  className="mt-4 inline-flex rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  Đi tới trang khiếu nại
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
