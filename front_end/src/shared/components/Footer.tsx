"use client";

import Link from "next/link";
import { Globe2 } from "lucide-react";

const footerColumns = [
  {
    title: "Hỗ trợ",
    links: [
      "Trung tâm trợ giúp",
      "AirCover cho khách",
      "Chính sách hủy",
      "Báo cáo vấn đề khu dân cư",
    ],
  },
  {
    title: "Đón tiếp khách",
    links: [
      "Cho thuê chỗ ở trên GoStay",
      "Tài nguyên cho chủ nhà",
      "Diễn đàn cộng đồng",
      "Đón tiếp khách có trách nhiệm",
    ],
  },
  {
    title: "GoStay",
    links: [
      "Trang tin tức",
      "Tính năng mới",
      "Cơ hội nghề nghiệp",
      "Nhà đầu tư",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#DDDDDD] bg-[#F7F7F7] pb-20 text-[#222222] md:pb-0">
      <div className="mx-auto max-w-[1760px] px-6 py-12 md:px-10 xl:px-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {footerColumns.map((column) => (
            <section key={column.title}>
              <h2 className="text-sm font-semibold leading-[18px]">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm font-normal leading-[18px] text-[#717171] transition hover:text-[#222222] hover:underline"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#DDDDDD] pt-6 text-sm text-[#717171] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© 2026 GoStay, Inc.</span>
            <span>·</span>
            <Link href="#" className="hover:text-[#222222] hover:underline">
              Quyền riêng tư
            </Link>
            <span>·</span>
            <Link href="#" className="hover:text-[#222222] hover:underline">
              Điều khoản
            </Link>
            <span>·</span>
            <Link href="#" className="hover:text-[#222222] hover:underline">
              Sơ đồ trang web
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-semibold text-[#222222]">
            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
            >
              <Globe2 className="h-4 w-4" />
              Tiếng Việt (VN)
            </button>
            <button type="button" className="hover:underline">
              ₫ VND
            </button>
            <div className="flex items-center gap-4" aria-label="Mạng xã hội">
              <Link href="#" aria-label="Facebook" className="hover:opacity-70">
                <span className="text-base font-bold">f</span>
              </Link>
              <Link href="#" aria-label="Twitter" className="hover:opacity-70">
                <span className="text-base font-bold">x</span>
              </Link>
              <Link href="#" aria-label="Instagram" className="hover:opacity-70">
                <span className="text-base font-bold">◎</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
