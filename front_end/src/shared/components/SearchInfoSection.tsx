import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

type FieldState = "place" | "date" | "service";
type SearchInfo =
  | {
      place?: string;
      date?: DateRange;
      service?: string;
    }
  | undefined;

export default function SearchInfoSection({
  onClickSearch,
}: {
  onClickSearch?: (value: SearchInfo) => void;
}) {
  const [searchInfo, setSearchInfo] = useState<SearchInfo>();
  const [hover, setHover] = useState<FieldState>();
  const [searchButtonHover, setSearchButtonHover] = useState(false);
  const [open, setOpen] = useState<FieldState>();
  const searchButton = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = searchButton.current;
    if (!el) return;

    const h = el.offsetHeight;
    el.style.width = `${h}px`;
  }, []);

  //   useEffect(() => {
  //     console.log(searchInfo);
  //   }, [searchInfo]);

  return (
    <div className="bg-app-bg center-y shadow-app-secondary h-[70] w-full rounded-full shadow">
      {/* SLIDE LINE */}
      <div></div>
      {/* Chọn địa điểm */}
      <Select
        open={open == "place" ? true : false}
        onOpenChange={(e) => {
          setOpen(e ? "place" : undefined);
        }}
        onValueChange={(value) =>
          setSearchInfo({ ...searchInfo, place: value })
        }
      >
        <SelectTrigger
          className="hover:bg-app-muted col ba h-full! w-1/3 items-start justify-evenly gap-0 rounded-full border-none p-0 pr-4 pl-6 whitespace-normal focus-visible:ring-0 [&>svg]:hidden"
          onMouseEnter={() => {
            setHover("place");
          }}
          onMouseLeave={() => {
            setHover(undefined);
          }}
        >
          <div className="text-app-fg text-xs">Địa điểm</div>

          <div className="">
            {searchInfo?.place ? (
              <span className="line-clamp-1 text-sm">{searchInfo.place}</span>
            ) : (
              <span className="text-app-muted-fg line-clamp-1 text-xs">
                Lựa chọn địa điểm
              </span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent side="bottom" sideOffset={4} position="popper">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div
        className={cn(
          "bg-app-muted-fg/50 h-7/10 w-[0.5] rounded-full transition-colors duration-300",
          (hover == "place" || hover == "date") && "bg-transparent",
        )}
      />
      {/* Chọn ngày */}
      <Popover
        open={open == "date" ? true : false}
        onOpenChange={(e) => {
          setOpen(e ? "date" : undefined);
        }}
      >
        <PopoverTrigger asChild className="w-1/3 border-none whitespace-normal">
          <div
            className="col hover:bg-app-muted size-full items-start justify-evenly gap-0 rounded-full px-4"
            onMouseEnter={() => {
              setHover("date");
            }}
            onMouseLeave={() => {
              setHover(undefined);
            }}
          >
            <span className="text-xs">Thời gian</span>
            {searchInfo?.date?.from ? (
              searchInfo?.date.to ? (
                <span className="line-clamp-1 text-sm">
                  {format(searchInfo?.date.from, "dd/MM/yyyy")} -{" "}
                  {format(searchInfo?.date.to, "dd/MM/yyyy")}
                </span>
              ) : (
                <span className="line-clamp-1 text-sm">
                  {format(searchInfo?.date.from, "dd/MM/yyyy")}
                </span>
              )
            ) : (
              <span className="text-app-muted-fg line-clamp-1 text-xs">
                Chọn ngày
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={searchInfo?.date}
            onSelect={(e) => {
              // Nếu chưa có from hoặc đã có đủ range → bắt đầu lại
              if (!searchInfo?.date?.from || searchInfo?.date?.to) {
                setSearchInfo({
                  ...searchInfo,
                  date: { from: e?.from, to: undefined },
                });
                return;
              }
              // Nếu đã có from → set to
              setSearchInfo({ ...searchInfo, date: e });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <div
        className={cn(
          "bg-app-muted-fg/50 h-7/10 w-[0.5] rounded-full transition-colors duration-300",
          (hover == "service" || hover == "date") &&
            !searchButtonHover &&
            "bg-transparent",
        )}
      />
      {/* Chọn dịch vụ */}
      <Select
        open={open == "service" ? true : false}
        onOpenChange={(e) => {
          if (searchButtonHover) {
            return;
          }
          setOpen(e ? "service" : undefined);
        }}
        onValueChange={(value) =>
          setSearchInfo({ ...searchInfo, service: value })
        }
      >
        <SelectTrigger
          className={cn(
            "row h-full! w-1/3 min-w-0 gap-0 rounded-full border-none p-0 pr-3 pl-4 break-all whitespace-normal focus-visible:ring-0 [&>svg]:hidden",
            searchButtonHover || "hover:bg-app-muted",
          )}
          onMouseEnter={() => {
            setHover("service");
          }}
          onMouseLeave={() => {
            setHover(undefined);
          }}
        >
          <div className="flex h-full flex-1 flex-col items-start justify-evenly">
            <div className="text-app-fg line-clamp-1 text-xs">Dịch vụ</div>
            <div className="">
              {searchInfo?.service ? (
                <div className="line-clamp-1 text-sm">{searchInfo.service}</div>
              ) : (
                <div className="text-app-muted-fg line-clamp-1 w-full text-xs">
                  Lựa chọn dịch vụ
                </div>
              )}
            </div>
          </div>
          {/* SEARCH BUTTON */}
          <div
            ref={searchButton}
            className="row bg-app-primary h-[calc(100%-12px)] items-center overflow-hidden rounded-full transition-[width] duration-500"
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              const h = el.offsetHeight;
              el.style.width = `${h * 2.5}px`;
              setSearchButtonHover(true);
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              const h = el.offsetHeight;
              el.style.width = `${h}px`;
              setSearchButtonHover(false);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onClickSearch?.(searchInfo);
            }}
          >
            <div className="center aspect-square h-full w-auto">
              <Search className="text-app-primary-fg" />
            </div>
            <div className="">
              <div className="text-app-primary-fg line-clamp-1">Tìm kiếm</div>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent side="bottom" sideOffset={4} position="popper">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
