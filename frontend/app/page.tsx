import { HeroCarousel } from "@/components/hero-carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="px-4 sm:px-6 md:px-8 mx-auto mt-8">
        <HeroCarousel />

        <div className="flex flex-wrap justify-start gap-2 sm:gap-3 mt-6 sm:mt-8">
          <Button
            variant="outline"
            className="bg-black text-white text-xs sm:text-sm md:text-base px-2 sm:px-4 py-1 sm:py-2"
          >
            Outfit of the Day
          </Button>
          <Button
            variant="outline"
            className="text-xs sm:text-sm md:text-base px-2 sm:px-4 py-1 sm:py-2"
          >
            For You
          </Button>
          <Button
            variant="outline"
            className="text-xs sm:text-sm md:text-base px-2 sm:px-4 py-1 sm:py-2"
          >
            Hot Promo
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 mx-auto mt-3">
        <div className="wrapper flex flex-col sm:flex-row justify-between gap-6">
          {[
            {
              img: "https://images.unsplash.com/photo-1521334884684-d80222895322",
              title: "Casual Wear",
            },
            {
              img: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
              title: "Formal Attire",
            },
            {
              img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
              title: "Sportswear",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="card relative w-full sm:w-1/3 h-[250px] sm:h-[300px] rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 text-black p-3 sm:p-4">
                <h2 className="text-sm sm:text-md md:text-lg font-semibold">
                  {item.title}
                </h2>
                <p className="mt-1 mb-2 sm:mb-3 text-sm sm:text-md md:text-lg">
                  Rp. 100.000
                  <span className="text-[10px] sm:text-xs text-red-600 line-through ml-2 sm:ml-3">
                    Rp.125.000
                  </span>
                </p>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <Button className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4">
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="link"
                    className="text-xs sm:text-sm p-0 sm:p-2"
                  >
                    Detail
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
