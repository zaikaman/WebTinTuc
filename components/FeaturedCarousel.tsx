"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { proxyImageUrl } from "@/lib/image-proxy";
import { formatCategory, formatVietnameseDate } from "@/lib/utils";
import type { Article } from "@/lib/types/news";

interface FeaturedCarouselProps {
  articles: Article[];
}

export function FeaturedCarousel({ articles }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = articles.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Reset and restart the interval timer whenever index changes or hover status changes
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!isHovered && totalSlides > 0) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, isHovered, nextSlide, totalSlides]);

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex];
  const categorySlug = currentArticle.categorySlug || currentArticle.category;

  return (
    <div
      className="group/carousel relative bg-white border border-gray-200 rounded-sm overflow-hidden p-3.5 shadow-sm hover:shadow-md transition-shadow duration-300 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 16:9 Image Area */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 rounded-sm border border-gray-200">
        {articles.map((article, idx) => {
          const isActive = idx === currentIndex;
          return (
            <Link
              key={article.id}
              href={`/posts/${article.id}`}
              prefetch={true}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={proxyImageUrl(article.image) || "/placeholder.svg"}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 650px"
                className="object-cover hover:scale-[1.02] transition-transform duration-700 ease-out"
                priority={idx === 0}
              />
              
              {/* Subtle Dark Gradient Overlay at the Bottom for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </Link>
          );
        })}

        {/* Circular Prev Arrow Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            prevSlide();
          }}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white/90 bg-black/20 hover:bg-black/45 active:scale-95 text-white flex items-center justify-center backdrop-blur-[1px] transition-all duration-200 shadow-md z-20 cursor-pointer select-none"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Circular Next Arrow Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            nextSlide();
          }}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white/90 bg-black/20 hover:bg-black/45 active:scale-95 text-white flex items-center justify-center backdrop-blur-[1px] transition-all duration-200 shadow-md z-20 cursor-pointer select-none"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Indicators Overlay at Bottom Center */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Info Area Below Image */}
      <div className="mt-3 mb-1 px-0.5">
        {/* Category & Date Info */}
        <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-[11px] text-gray-500 font-sans font-medium">
          <Link
            href={`/${categorySlug}`}
            prefetch={true}
            className="text-[#df3232] hover:text-[#df3232]/80 font-bold tracking-wide transition-colors duration-150 uppercase"
          >
            {formatCategory(currentArticle.category)}
          </Link>
          <span className="text-gray-300">&#8226;</span>
          <span className="flex items-center gap-1 text-gray-400">
            <Clock size={11} className="mr-0.5" />
            <span>{formatVietnameseDate(currentArticle.time)}</span>
          </span>
        </div>

        {/* Title Link */}
        <Link href={`/posts/${currentArticle.id}`} prefetch={true} className="group/title block">
          <h2 className="text-gray-900 font-bold text-[15px] sm:text-[19px] leading-snug tracking-tight group-hover/title:text-[#e24a48] transition-colors duration-200 font-sans line-clamp-none sm:line-clamp-2">
            {currentArticle.title}
          </h2>
        </Link>

        {/* Short description / Intro snippet */}
        {currentArticle.intro && (
          <p className="hidden sm:block text-gray-500 text-[12.5px] leading-relaxed mt-2 line-clamp-2 font-sans">
            {currentArticle.intro}
          </p>
        )}

        {/* Red Bottom Divider line */}
        <div className="h-[2px] bg-[#df3232] mt-3" />
      </div>
    </div>
  );
}
