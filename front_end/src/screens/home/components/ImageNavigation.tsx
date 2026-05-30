import { useSafeContext } from "@/shared/hooks";
import { cn } from "@/lib/utils";
import { HomeContext } from "@/screens/home/providers/home.provider";
import { useContext } from "react";
import { Fragment } from "react/jsx-runtime";

export default function ImageNavigation() {
  const { imageIndex, setImageIndex, setClock, landmarks } =
    useSafeContext(HomeContext);

  return (
    <div className="row justify-end">
      {landmarks?.map((e: any, index: any) => (
        <Fragment key={e?.id}>
          <div className="w-[10]" />
          <div
            className={cn(
              "border-app-muted-fg/25 aspect-video min-w-14 rounded-sm border hover:border-white lg:w-1/20",
              landmarks?.[imageIndex]?.id == e.id
                ? "border-3 border-white"
                : "border-transparent",
            )}
            onClick={() => {
              setClock(6000);
              setImageIndex(index);
            }}
          >
            <div className="relative size-full">
              <div className="absolute inset-0">
                <img
                  src={e.thumbnailUrl}
                  alt=""
                  className="size-full rounded-sm object-cover"
                />
              </div>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
