import { useSafeContext } from "@/hooks";
import { cn } from "@/lib/utils";
import { HomeContext } from "@/provider/home";
import { ServiceContext } from "@/provider/service";
import { useContext } from "react";
import { Fragment } from "react/jsx-runtime";

export default function ServiceImageNavigation() {
  const { serviceData, imageIndex, setImageIndex, clock, setClock } =
    useSafeContext(ServiceContext);

  const ctx = useContext(ServiceContext);

  return (
    <div className="row justify-end">
      {serviceData?.map((e: any, index: any) => (
        <Fragment key={e?.id}>
          <div className="w-[10]" />
          <div
            className={cn(
              "border-app-muted-fg/25 aspect-video min-w-14 rounded-sm border hover:border-white lg:w-1/20",
              serviceData?.[imageIndex]?.id == e.id
                ? "border-3 border-white"
                : "border-transparent",
            )}
            onClick={() => {
              clearInterval(clock ?? undefined);
              setClock(null);
              setImageIndex(index);
            }}
          >
            <div className="relative size-full">
              <div className="absolute inset-0">
                <img
                  src={e.image}
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
