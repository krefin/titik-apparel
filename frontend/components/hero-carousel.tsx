"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Slide = {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
};

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: "NEW DROP 2026",
    title: "Urban Streetwear Collection",
    subtitle: "Desain oversized dengan katun heavyweight 24s premium. Nyaman seharian.",
    ctaText: "Jelajahi Koleksi",
    ctaLink: "/products",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    tag: "LIMITED EDITION",
    title: "Vintage Washed Oversized Series",
    subtitle: "Warna washed otentik & material fleece tebal 330 GSM untuk kenyamanan ekstra.",
    ctaText: "Beli Sekarang",
    ctaLink: "/products",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    tag: "ESSENTIAL APPAREL",
    title: "Minimalist Daily Outfit",
    subtitle: "Gaya kasual modern dengan jahitan presisi dan bahan breathable tahan lama.",
    ctaText: "Lihat Katalog",
    ctaLink: "/products",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&auto=format&fit=crop&q=80",
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 mt-6 sm:mt-8 md:mt-10 group">
      {/* Slides Background */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover object-center scale-105 transition-transform duration-10000 ease-linear"
              unoptimized
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

            {/* Content Container */}
            <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 z-20">
              <div className="max-w-2xl space-y-4">
                {/* Badge Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase shadow-lg border border-blue-400/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  {slide.tag}
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed line-clamp-2 max-w-xl drop-shadow">
                  {slide.subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 py-6 font-bold shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 hover:scale-105 transition-all duration-300 gap-2"
                  >
                    <Link href={slide.ctaLink}>
                      <ShoppingBag className="w-5 h-5" />
                      {slide.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white hover:bg-slate-100 text-slate-900 hover:text-blue-600 rounded-full px-7 py-6 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <Link href="/products">Lihat Semua Produk</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Manual Chevron Buttons */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 shadow-xl"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 shadow-xl"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Navigation Indicators */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-30 flex items-center gap-2.5 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-8 bg-blue-500 shadow-md shadow-blue-500/50"
                : "w-2.5 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
