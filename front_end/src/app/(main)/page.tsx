import HomeClient from "@/screens/home/components/HomeClient";
import { ExperienceServices, PlaceServices, ServiceServices } from "@/services";
import HomeProvider from "@/screens/home/providers/home.provider";
import { FilterService } from "@/services/filter";

export default async function Page() {
  const experiences = await ExperienceServices.getAll();
  const places = await PlaceServices.getAll();
  const services = await ServiceServices.getAll();

  return (
    <HomeProvider
      initExperiences={experiences}
      initPlace={places}
      initServices={services}
    >
      <HomeClient />
    </HomeProvider>
  );
}
