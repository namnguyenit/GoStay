"use client";

import HostService from "@/services/host.service";
import NewListingForm from "@/shared/components/NewListingForm";

export default function HostNewListingPage() {
  return (
    <NewListingForm
      ownerType="host"
      serviceApi={HostService}
      redirectPath="/host/listings"
    />
  );
}
