import type { DateRange } from "react-day-picker";

export type Filter =
  | {
      place?: string;
      date?: DateRange;
      type?: string;
      subCategory?: string;
    }
  | undefined;
