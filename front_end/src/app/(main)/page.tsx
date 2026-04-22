import HomeClient from "@/app/(main)/components/HomeClient";
import { ExperienceService } from "@/services";
import HomeProvider from "./providers/home.provider";

export default async function Page() {
  const dataRes = await ExperienceService.fetch();
  const data = dataRes?.data;
  return (
    <HomeProvider initExperiences={data ?? null}>
      <HomeClient />
    </HomeProvider>
  );
}
