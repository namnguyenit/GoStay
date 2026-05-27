import HomeClient from "@/screens/home/components/HomeClient";
import { ExperienceServices, PlaceServices, ServiceServices } from "@/services";
import HomeProvider from "@/screens/home/providers/home.provider";

const fallbackExperiences = [
  {
    id: "exp-1",
    name: "Khám Phá Vịnh Hạ Long",
    price: 1500000,
    description: "Trải nghiệm chèo thuyền kayak và ngủ đêm trên du thuyền 5 sao giữa kỳ quan thiên nhiên thế giới.",
    address: "Vịnh Hạ Long, Quảng Ninh",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800"
  },
  {
    id: "exp-2",
    name: "Tour Ẩm Thực Đường Phố Hà Nội",
    price: 350000,
    description: "Thưởng thức phở cuốn, bún chả, cà phê trứng tại các con ngõ cổ kính của thủ đô.",
    address: "Hoàn Kiếm, Hà Nội",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800"
  },
  {
    id: "exp-3",
    name: "Chinh Phục Đỉnh Fansipan",
    price: 1200000,
    description: "Hành trình cáp treo và leo núi chinh phục Nóc nhà Đông Dương mờ sương.",
    address: "Sa Pa, Lào Cai",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800"
  }
];

const fallbackPlaces = [
  {
    id: "place-1",
    name: "InterContinental Danang",
    price: 8500000,
    description: "Khu nghỉ dưỡng sang trọng bậc nhất tọa lạc tại bán đảo Sơn Trà hoang sơ.",
    address: "Sơn Trà, Đà Nẵng",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800"
  },
  {
    id: "place-2",
    name: "Hotel de la Coupole",
    price: 2800000,
    description: "Sự kết hợp hoàn hảo giữa thời trang Pháp cao cấp và nét văn hóa vùng cao Sa Pa.",
    address: "Sa Pa, Lào Cai",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800"
  },
  {
    id: "place-3",
    name: "Six Senses Ninh Van Bay",
    price: 12500000,
    description: "Biệt thự sát biển với hồ bơi vô cực riêng tư hòa mình vào thiên nhiên thanh bình.",
    address: "Vịnh Ninh Vân, Nha Trang",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800"
  }
];

const fallbackServices = [
  {
    id: "svc-1",
    name: "Thuê Xe Máy Tự Lái Đà Lạt",
    price: 120000,
    description: "Nhận xe tận nơi, nón bảo hiểm chuẩn chất lượng, xe đời mới êm ái thích hợp đèo dốc.",
    address: "Liên Nghĩa, Lâm Đồng",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800"
  },
  {
    id: "svc-2",
    name: "Sim Du Lịch 4G Tốc Độ Cao",
    price: 150000,
    description: "Sim vật lý hoặc eSIM kết nối mạng tốc độ cao toàn quốc ngay khi kích hoạt.",
    address: "Toàn quốc",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=800"
  },
  {
    id: "svc-3",
    name: "Đón Tiễn Sân Bay Tân Sơn Nhất",
    price: 250000,
    description: "Xe 4-7 chỗ sang trọng, tài xế lịch thiệp đón đúng giờ kèm bảng tên nhiệt tình.",
    address: "Tân Bình, TP. HCM",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800"
  }
];

const fallbackLandmarks = [
  { id: "lm-1", name: "Vịnh Hạ Long", province: "Quảng Ninh" },
  { id: "lm-2", name: "Sa Pa", province: "Lào Cai" },
  { id: "lm-3", name: "Đà Nẵng", province: "Đà Nẵng" },
  { id: "lm-4", name: "Phú Quốc", province: "Kiên Giang" }
];

export default async function Page() {
  let experiences = fallbackExperiences;
  let places = fallbackPlaces;
  let services = fallbackServices;
  let landmarks = fallbackLandmarks;

  try {
    const data = await PlaceServices.getLandmarks();
    landmarks = data || [];
  } catch (err) {
    console.warn("Could not load landmarks from API, using fallback landmarks.");
  }

  try {
    const data = await ExperienceServices.getAll();
    experiences = data || [];
  } catch (err) {
    console.warn("Could not load experiences from API, using premium fallback mock data.");
  }

  try {
    const data = await PlaceServices.getAll();
    places = data || [];
  } catch (err) {
    console.warn("Could not load places from API, using premium fallback mock data.");
  }

  try {
    const data = await ServiceServices.getAll();
    services = data || [];
  } catch (err) {
    console.warn("Could not load services from API, using premium fallback mock data.");
  }

  return (
    <HomeProvider
      initExperiences={experiences}
      initPlace={places}
      initServices={services}
      initLandmarks={landmarks}
    >
      <HomeClient />
    </HomeProvider>
  );
}
