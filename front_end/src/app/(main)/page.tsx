import HomeClient from "@/app/(main)/HomeClient";
import HomeProvider from "@/provider/home";
import ServiceProvider from "@/provider/service";

export default async function Page() {
  const res = await fetch("http://localhost:3001/api/service");
  const json = await res.json();
  const data = json.data;

  // const clean = ServicesSchema.safeParse(data);

  // let test = null;
  // if (clean.success) {
  //   test = clean.data;
  // }

  return (
    <ServiceProvider initData={data}>
      <HomeProvider>
        <HomeClient />
      </HomeProvider>
    </ServiceProvider>
  );
}
