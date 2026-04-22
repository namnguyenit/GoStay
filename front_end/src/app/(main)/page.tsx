import HomeClient from "@/app/(main)/HomeClient";
import HomeProvider from "@/provider/home";
import ServiceProvider from "@/provider/service";
import { ExperienceService } from "@/services";

export default async function Page() {
  const dataRes = await ExperienceService.fetch();
  const data = dataRes?.data;
  return (
    <ServiceProvider initData={data}>
      <HomeProvider>
        <HomeClient />
      </HomeProvider>
    </ServiceProvider>
  );
}
