"use client";

import EnterpriseService from "@/services/enterprise.service";
import NewListingForm from "@/shared/components/NewListingForm";

export default function EnterpriseNewListingPage() {
  return (
    <NewListingForm
      ownerType="enterprise"
      serviceApi={EnterpriseService}
      redirectPath="/enterprise/listings"
    />
  );
}
