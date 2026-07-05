"use client";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [recordedImpressions, setRecordedImpressions] = useState<number[]>([]);

  // Lấy danh sách tất cả quảng cáo active cho vị trí này
  const activeAds = ads.filter((a) => a.position === position && a.status === "active");

  // Xử lý slider
  useEffect(() => {
    if (activeAds.length <= 1) return;
    
    // Đổi slide mỗi 6 giây (6000ms)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [activeAds.length]);

  const currentAd = activeAds.length > 0 ? activeAds[currentIndex] : null;
  const finalImg = currentAd?.media_key || fallbackImg;
  const adId = currentAd?.id;

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

  if (!finalImg && !currentAd?.html_code) {
    return null;
  }

  return (
    <div ref={containerRef} className={`relative group overflow-hidden ${className}`}>
      {/* Container của các slides để tạo hiệu ứng chuyển động mượt mà */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeAds.length > 0 ? (
          activeAds.map((ad) => (
            <div key={ad.id} className="w-full h-full flex-shrink-0">
              {ad.type === "html" && ad.html_code ? (
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: ad.html_code }}
                  onClick={() => handleClick(ad.id)}
                />
              ) : (
                <a 
                  href={ad.target_url || fallbackLink} 
                  className="block w-full h-full" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => handleClick(ad.id)}
                >
                  <img
                    src={ad.media_key || fallbackImg}
                    alt={`Quảng cáo ${position}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="w-full h-full flex-shrink-0">
            <a 
              href={fallbackLink} 
              className="block w-full h-full" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img
                src={fallbackImg}
                alt={`Quảng cáo ${position}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>
        )}
      </div>

      {/* Hiển thị dots nếu có nhiều hơn 1 quảng cáo */}
      {activeAds.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {activeAds.map((_, idx) => (
            <div 
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-white w-3" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}

      <div className="absolute top-1.5 right-1.5 bg-black/45 hover:bg-black/75 text-white/90 text-[9px] px-1.5 py-0.5 cursor-pointer rounded-sm select-none z-10 transition-colors">
        Quảng cáo
      </div>
    </div>
  );
}
