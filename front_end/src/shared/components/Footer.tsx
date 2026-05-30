"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ShieldCheck,
  Globe,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-16 pb-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Top Section: Branding & Newsletter */}
        <div className="grid grid-cols-1 gap-10 border-b border-zinc-900 pb-12 lg:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-wider text-white hover:text-app-primary transition-colors">
                GoTravel
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              Trải nghiệm những kỳ nghỉ tuyệt vời và dịch vụ du lịch hàng đầu Việt Nam. Chúng tôi đồng hành cùng bạn trên mọi hành trình khám phá thế giới.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-app-primary hover:text-white transition-all duration-300"
                title="Facebook"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-app-primary hover:text-white transition-all duration-300"
                title="Instagram"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-app-primary hover:text-white transition-all duration-300"
                title="Twitter"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-app-primary hover:text-white transition-all duration-300"
                title="Youtube"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.511a3.003 3.003 0 00-2.11 2.107C0 8.021 0 12 0 12s0 3.979.502 5.837a3.003 3.003 0 002.11 2.107c1.86.511 9.388.511 9.388.511s7.528 0 9.388-.511a3.003 3.003 0 002.11-2.107C24 15.979 24 12 24 12s0-3.979-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
              Nhận thông báo ưu đãi
            </h3>
            <p className="text-sm text-zinc-500 max-w-lg">
              Đăng ký nhận bản tin để không bỏ lỡ các chương trình khuyến mãi đặc biệt và cẩm nang du lịch hữu ích từ chúng tôi.
            </p>
            <form onSubmit={handleSubscribe} className="relative max-w-md w-full">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Địa chỉ email của bạn..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300 focus:border-app-primary focus:bg-zinc-900/90"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-app-primary px-5 py-3 text-sm font-bold text-white hover:bg-app-primary/90 transition-all duration-300 cursor-pointer shadow-md shadow-app-primary/10 active:scale-98"
                >
                  <span>Đăng ký</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="absolute -bottom-6 left-0 text-xs font-medium text-emerald-500 animate-fade-in">
                  Cảm ơn bạn đã đăng ký nhận bản tin thành công!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Middle Section: Footer Navigation Links */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Services Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Dịch vụ du lịch
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/place" className="hover:text-white transition-colors flex items-center gap-0.5 group">
                  <span>Nơi cư trú</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/experience" className="hover:text-white transition-colors flex items-center gap-0.5 group">
                  <span>Trải nghiệm du lịch</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/service" className="hover:text-white transition-colors flex items-center gap-0.5 group">
                  <span>Dịch vụ di chuyển</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors flex items-center gap-0.5 group">
                  <span>Combo vé & phòng</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Destinations Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Điểm đến hấp dẫn
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/search?place=Hà Nội" className="hover:text-white transition-colors">
                  Du lịch Hà Nội
                </Link>
              </li>
              <li>
                <Link href="/search?place=Lào Cai" className="hover:text-white transition-colors">
                  Sapa (Lào Cai)
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Vịnh Hạ Long
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Đà Nẵng - Hội An
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp (FAQ)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hướng dẫn đặt phòng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách hoàn tiền
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Phương thức thanh toán
                </a>
              </li>
            </ul>
          </div>

          {/* Partner & Legal Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Điều khoản & Chính sách
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách cookie
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Quy chế hoạt động
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="col-span-2 space-y-4 md:col-span-4 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-app-primary" />
                <span className="leading-relaxed">
                  Tòa nhà Lotte, 54 Liễu Giai, Ba Đình, Hà Nội, Việt Nam
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4.5 w-4.5 flex-shrink-0 text-app-primary" />
                <a href="tel:19001234" className="hover:text-white transition-colors font-medium">
                  1900 1234
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 flex-shrink-0 text-app-primary" />
                <a href="mailto:support@gotravel.com.vn" className="hover:text-white transition-colors">
                  support@gotravel.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright, Payment Icons & Trust Badges */}
        <div className="flex flex-col gap-6 border-t border-zinc-900 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} GoTravel. Toàn bộ bản quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Giao dịch an toàn & bảo mật 256-bit SSL</span>
            </div>
          </div>

          {/* Payments & Badges */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Payment Gateway SVGs */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Visa */}
              <div className="flex h-7 w-11 items-center justify-center rounded bg-white px-1.5 shadow-sm" title="Visa">
                <svg viewBox="0 0 24 8" className="h-3 w-auto">
                  <path d="M3.7 0L1.7 8h1.8L5.3 0H3.7zm7.3 0L9.8 5.6 9.3.9A1.5 1.5 0 007.8 0H4.7L4.6.4c1 .3 1.9.9 2.2 1.6l1.5 6H10l3-8h-2.1zm8 2.2a2.3 2.3 0 00-.8-.1c-1.3 0-2.2.7-2.2 1.8 0 .8.7 1.2 1.2 1.5.5.3.7.4.7.7 0 .4-.5.6-1 .6a1.6 1.6 0 01-1.3-.6l-.2-.1-.3 1.8a2.5 2.5 0 001.7.6c2.1 0 3.5-1 3.5-2.6 0-.8-.5-1.5-1.6-2a3 3 0 01-1-1.1c0-.4.4-.6.9-.6a1.5 1.5 0 011.1.5l.2.1.2-1.6zM22.5 0l-1.6 8h1.7l1.7-8h-1.8z" fill="#1434CB"/>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="flex h-7 w-11 items-center justify-center rounded bg-white px-1.5 shadow-sm" title="Mastercard">
                <svg viewBox="0 0 24 16" className="h-5 w-auto">
                  <circle cx="8" cy="8" r="8" fill="#EB001B" />
                  <circle cx="16" cy="8" r="8" fill="#F79E1B" fillOpacity="0.8" />
                </svg>
              </div>
              {/* Apple Pay */}
              <div className="flex h-7 w-11 items-center justify-center rounded bg-white px-1.5 shadow-sm" title="Apple Pay">
                <span className="text-[9px] font-black text-black select-none"> Pay</span>
              </div>
              {/* MoMo style */}
              <div className="flex h-7 w-11 items-center justify-center rounded bg-[#A50064] text-white shadow-sm" title="MoMo">
                <span className="text-[8px] font-black tracking-tighter">momo</span>
              </div>
              {/* VNPAY style */}
              <div className="flex h-7 w-11 items-center justify-center rounded bg-[#005BAA] text-white shadow-sm" title="VNPAY">
                <span className="text-[7px] font-black italic tracking-tighter">VN<span className="text-red-500">PAY</span></span>
              </div>
            </div>

            {/* BCT registered logo */}
            <a
              href="#"
              className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity border border-zinc-800 rounded px-2 py-0.5"
              title="Đã thông báo Bộ Công Thương"
            >
              <div className="h-5 w-auto flex items-center">
                <svg viewBox="0 0 100 40" className="h-4 w-auto fill-red-500">
                  <path d="M5 25h10v2H5zm0-5h15v2H5zm0-5h15v2H5zm25 15c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-16c-3.8 0-7 3.2-7 7s3.2 7 7 7 7-3.2 7-7-3.2-7-7-7zm25 16h-10V10h10v20zm-8-2h6V12h-6v16zm23 2c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-16c-3.8 0-7 3.2-7 7s3.2 7 7 7 7-3.2 7-7-3.2-7-7-7z" />
                </svg>
              </div>
              <span className="text-[6px] font-extrabold uppercase text-zinc-400 leading-none">Đã đăng ký<br/><span className="text-[5px] text-zinc-500">Bộ Công Thương</span></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
