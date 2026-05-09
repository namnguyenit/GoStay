import HomeClient from "@/screens/home/components/HomeClient";
import { ExperienceService, PlaceService, ServiceService } from "@/services";
import HomeProvider from "@/screens/home/providers/home.provider";

export default async function Page() {
  const experiencesRes = await ExperienceService.getAll();
  const experiences = experiencesRes?.data;

  const placesRes = await PlaceService.getAll();
  const places = placesRes?.data;

  const servicesRes = await ServiceService.getAll();
  const services = servicesRes?.data;

  return (
    <HomeProvider
      initExperiences={experiences ?? null}
      initPlace={places ?? undefined}
      initServices={services ?? undefined}
    >
      <HomeClient />
    </HomeProvider>
  );
}
