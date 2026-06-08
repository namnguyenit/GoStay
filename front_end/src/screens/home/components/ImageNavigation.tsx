import { useSafeContext } from "@/shared/hooks";
import { cn } from "@/lib/utils";
import { HomeContext } from "@/screens/home/providers/home.provider";

export default function ImageNavigation() {
  const { imageIndex, setImageIndex, setClock, landmarks } =
    useSafeContext(HomeContext);

  return (
    <div className="flex items-center justify-center md:justify-end gap-2.5 w-full flex-wrap">
      {landmarks?.slice(0, 6).map((e: any, index: any) => {
        const isActive = landmarks?.[imageIndex]?.id === e.id;
        return (
          <div
            key={e?.id}
            onClick={() => {
              setClock(6000);
              setImageIndex(index);
            }}
            className={cn(
              "relative w-[60px] h-[40px] rounded-[4px] cursor-pointer transition-all duration-300 overflow-hidden",
              isActive
                ? "border-2 border-[#FF385C] scale-105 shadow-[0_4px_10px_rgba(0,0,0,0.3)] opacity-100"
                : "border border-white/40 hover:border-white hover:scale-102 opacity-70 hover:opacity-100"
            )}
          >
            <img
              src={e.thumbnailUrl}
              alt={e.name || ""}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
