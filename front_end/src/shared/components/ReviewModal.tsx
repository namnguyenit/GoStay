import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import ServiceServices from '@/services/service';

interface ReviewModalProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ listingId, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await ServiceServices.submitReview({
        listingId,
        rating,
        comment,
        images: []
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-lg text-app-fg">Viết đánh giá</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center space-y-2">
            <span className="text-app-fg font-medium">Chất lượng dịch vụ</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'fill-zinc-100 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-fg">Đánh giá của bạn</label>
            <textarea
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent p-3 text-app-fg focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px] resize-none"
              placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
}
