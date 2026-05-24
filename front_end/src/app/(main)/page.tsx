import HomeClient from "@/screens/home/components/HomeClient";
import { ExperienceService, PlaceService, ServiceService } from "@/services";
import HomeProvider from "@/screens/home/providers/home.provider";

export default async function Page() {
  let experiencesRes, placesRes, servicesRes;

  try {
    experiencesRes = await ExperienceService.getAll();
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
  }
  const experiences = experiencesRes?.data;

  try {
    placesRes = await PlaceService.getAll();
  } catch (error) {
    console.error("Failed to fetch places:", error);
  }
  const places = placesRes?.data;

  try {
    servicesRes = await ServiceService.getAll();
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }
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
