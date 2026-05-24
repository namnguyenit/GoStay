import React from "react";

interface HostDetailModalProps {
  isOpen: boolean;
  hostData: any;
  isLoading: boolean;
  onClose: () => void;
}

export function HostDetailModal({ isOpen, hostData, isLoading, onClose }: HostDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Chi tiết Host</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : hostData?.error ? (
          <p className="text-red-500 text-sm">Không thể tải thông tin chi tiết.</p>
        ) : hostData ? (
          <div className="space-y-2 text-sm">
            {Object.entries(hostData).map(([key, val]) => (
              <div key={key} className="flex gap-2 border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-500 w-36 shrink-0">{key}</span>
                <span className="text-gray-800 break-all">
                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Không có dữ liệu.</p>
        )}
      </div>
    </div>
  );
}