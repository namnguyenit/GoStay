"use client";

import { FilterService } from "@/services/filter";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Filter } from "@/modules/filter";
import { useSearchParams } from "next/navigation";

export default function PlaceClient() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    setFilter(FilterService.get(params));
  }, []);

  return (
    <table>
      <tbody>
        <tr>
          <td>Địa điểm: </td>
          <td>{filter?.place}</td>
        </tr>
        <tr>
          <td>Loại: </td>
          <td>{filter?.type}</td>
        </tr>
        <tr>
          <td>From: </td>
          <td>
            {filter?.date?.from
              ? format(filter?.date?.from, "dd/MM/yyyy")
              : undefined}
          </td>
        </tr>
        <tr>
          <td>To: </td>
          <td>
            {filter?.date?.to
              ? format(filter?.date?.to, "dd/MM/yyyy")
              : undefined}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
