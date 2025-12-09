import { HeroCarousel } from "@/components/hero-carousel";
import ProductsGrid from "@/components/products/products-grid";
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
        <ProductsGrid />
      </div>
    </>
  );
}
