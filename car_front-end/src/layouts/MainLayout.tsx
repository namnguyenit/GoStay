import React from "react";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} GoStay Long-Distance Bus System. All
          rights reserved. (Port 3334 - Consuming API Gateway)
        </div>
      </footer>
    </div>
  );
};
