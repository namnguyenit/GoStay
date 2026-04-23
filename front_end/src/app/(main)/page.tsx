import HomeClient from "@/app/(main)/components/HomeClient";
import { ExperienceService, PlaceService } from "@/services";
import HomeProvider from "./providers/home.provider";

export default async function Page() {
  const experiencesRes = await ExperienceService.getAll();
  const experiences = experiencesRes?.data;

  const placesRes = await PlaceService.getAll();
  const places = placesRes?.data;

  console.log(places);

  return (
    <HomeProvider
      initExperiences={experiences ?? null}
      initPlace={places ?? null}
    >
      <HomeClient />
    </HomeProvider>
  );
}
