"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Ad {
  id: number;
  position: string;
  media_key?: string;
  target_url?: string;
  status: "active" | "inactive";
  html_code?: string;
  type?: "image" | "html" | "video";
}

interface AdBannerProps {
  position: string;
  ads: Ad[];
  fallbackImg?: string;
  fallbackLink?: string;
  className?: string;
}

export default function AdBanner({
  position,
  ads,
  fallbackImg,
  fallbackLink = "#",
  className = "",
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [recordedImpressions, setRecordedImpressions] = useState<number[]>([]);

  // Lấy danh sách tất cả quảng cáo active cho vị trí này
  const activeAds = ads.filter((a) => a.position === position && a.status === "active");

  useEffect(() => {
    setIsMounted(true);
    if (activeAds.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeAds.length);
      setSelectedAd(activeAds[randomIndex]);
    }
  }, [activeAds]);

  // Intersection Observer để kiểm tra xem Banner có nằm trong Viewport không
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const adId = selectedAd?.id;

  // Ghi nhận Impression khi Ad hiện tại đang trong Viewport và chưa được ghi nhận
  useEffect(() => {
    if (isInView && adId && !recordedImpressions.includes(adId)) {
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      }).catch(() => {});
      
      setRecordedImpressions((prev) => [...prev, adId]);
    }
  }, [isInView, adId, recordedImpressions]);

  const handleClick = (id?: number) => {
    if (id) {
      fetch("/api/ads/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: id }),
      }).catch(() => {});
    }
  };

  const hasActiveAds = activeAds.length > 0;

  // If no ads booked, we can render fallback immediately on server & client
  if (!hasActiveAds && !fallbackImg) {
    return null;
  }

  // Render a skeleton/blank placeholder on server to prevent hydration mismatch
  if (hasActiveAds && !isMounted) {
    return (
      <div className={`relative overflow-hidden bg-gray-50/50 animate-pulse ${className}`} />
    );
  }

  const finalImg = selectedAd?.media_key || fallbackImg;
  const finalLink = selectedAd?.target_url || fallbackLink;

  return (
    <div 
      ref={containerRef} 
      className={`relative group overflow-hidden ${className} transition-opacity duration-300`}
    >
      {selectedAd?.type === "html" && selectedAd.html_code ? (
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: selectedAd.html_code }}
          onClick={() => handleClick(selectedAd.id)}
        />
      ) : (          <a 
          href={finalLink} 
          className="block w-full h-full relative" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => handleClick(selectedAd?.id)}
        >
          {finalImg && (
            <Image
              src={finalImg}
              alt={`Quảng cáo ${position}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 970px"
              loading="lazy"
            />
          )}
        </a>
      )}

      <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded-sm select-none z-10 transition-colors">
        Quảng cáo
      </div>
    </div>
  );
}
