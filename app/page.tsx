import HomeaboutSection from "@/components/home/Homeaboutsection";
import HomepageSlider from "@/components/home/Homepageslider";
import HomeTestimonialsSection from "@/components/home/Hometestimonialssection";
import Image from "next/image";

export default function Home() {
  return (
   <>
   <HomepageSlider/>
   <HomeaboutSection/>
   <HomeTestimonialsSection/>
   </>
  );
}
