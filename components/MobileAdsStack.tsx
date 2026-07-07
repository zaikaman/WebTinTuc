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

interface MobileAdsStackProps {
  ads: Ad[];
}

export default function MobileAdsStack({ ads = [] }: MobileAdsStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(1); // Default to middle card (index 1)
  const [isInView, setIsInView] = useState(false);
  const [recordedImpressions, setRecordedImpressions] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [resolvedAds, setResolvedAds] = useState<{ [pos: string]: Ad | null }>({});

  // 3 ad positions defined for the stack
  const adPositions = [
    { position: "sidebar_1", fallbackImg: "/zento_cabinet_ad.webp", alt: "Quảng cáo 1" },
    { position: "sidebar_2", fallbackImg: "/ztc_bathtub_ad.webp", alt: "Quảng cáo 2" },
    { position: "sidebar_3", fallbackImg: "/zento_toilet_ad.webp", alt: "Quảng cáo 3" },
  ];

  useEffect(() => {
    setIsMounted(true);
    const resolved: { [pos: string]: Ad | null } = {};
    adPositions.forEach((pos) => {
      const activeAdsForPos = ads.filter((a) => a.position === pos.position && a.status === "active");
      if (activeAdsForPos.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeAdsForPos.length);
        resolved[pos.position] = activeAdsForPos[randomIndex];
      } else {
        resolved[pos.position] = null;
      }
    });
    setResolvedAds(resolved);
  }, [ads]);

  // Resolve active ads from DB or fallback
  const items = adPositions.map((pos) => {
    const activeAd = resolvedAds[pos.position] || null;
    return {
      ...pos,
      ad: activeAd,
    };
  });

  // Calculate relative card positions for the circular 3-card stack
  const getRelativePosition = (index: number) => {
    if (index === activeIndex) return "center";
    if (index === (activeIndex - 1 + 3) % 3) return "left";
    return "right";
  };

  // Autoplay functionality: rotates ads every 5 seconds, resets on index change
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // Intersection Observer to track if the carousel is visible in viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Track impression for the center ad
  const centerAd = items[activeIndex]?.ad;
  useEffect(() => {
    if (isInView && centerAd?.id && !recordedImpressions.includes(centerAd.id)) {
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: centerAd.id }),
      }).catch(() => {});

      setRecordedImpressions((prev) => [...prev, centerAd.id]);
    }
  }, [isInView, centerAd?.id, recordedImpressions]);

  // Handle click on left/right/center cards
  const handleCardClick = (e: React.MouseEvent, index: number, adId?: number) => {
    const pos = getRelativePosition(index);
    if (pos !== "center") {
      // Prevent link navigation if the card clicked is not in the center
      e.preventDefault();
      setActiveIndex(index);
    } else {
      // Center card clicked -> record click event to database
      if (adId) {
        fetch("/api/ads/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adId }),
        }).catch(() => {});
      }
    }
  };

  // Touch handlers for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped left -> show next (Right card becomes center)
        setActiveIndex((prev) => (prev + 1) % 3);
      } else {
        // Swiped right -> show prev (Left card becomes center)
        setActiveIndex((prev) => (prev - 1 + 3) % 3);
      }
    }
    touchStartX.current = null;
  };

  // CSS transforms for 3D stack effect
  const getCardStyle = (pos: "left" | "center" | "right") => {
    if (pos === "center") {
      return {
        transform: "translate(-50%, -50%) scale(1.05) rotateY(0deg)",
        zIndex: 30,
        opacity: 1,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.2)",
      };
    }
    if (pos === "left") {
      return {
        transform: "translate(-112%, -50%) scale(0.85) rotateY(25deg)",
        zIndex: 10,
        opacity: 0.5,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      };
    }
    // right
    return {
      transform: "translate(12%, -50%) scale(0.85) rotateY(-25deg)",
      zIndex: 10,
      opacity: 0.5,
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    };
  };

  if (!isMounted) {
    return (
      <div className="md:hidden w-full h-[320px] bg-gray-50/50 animate-pulse my-4 rounded-lg" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="md:hidden w-full flex flex-col items-center my-4 select-none"
    >
      {/* 3D Stack Viewport */}
      <div
        className="relative w-full h-[300px] overflow-hidden"
        style={{ perspective: "1000px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => {
          const pos = getRelativePosition(index);
          const hasHtml = item.ad?.type === "html" && item.ad.html_code;

          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 w-[138px] h-[276px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 transition-all duration-500 ease-out"
              style={{
                ...getCardStyle(pos),
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              <a
                href={item.ad?.target_url || "#"}
                target={pos === "center" && item.ad?.target_url ? "_blank" : undefined}
                rel={pos === "center" ? "noopener noreferrer" : undefined}
                onClick={(e) => handleCardClick(e, index, item.ad?.id)}
                className="block w-full h-full relative cursor-pointer"
              >
                {hasHtml ? (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: item.ad!.html_code! }}
                  />
                ) : (
                  <img
                    src={item.ad?.media_key || item.fallbackImg}
                    alt={item.alt}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                    draggable={false}
                  />
                )}
                
                {/* QC Badge */}
                <div className="absolute top-1.5 right-1.5 bg-black/40 text-white/95 text-[8.5px] px-1.5 py-0.5 rounded-sm select-none z-10 pointer-events-none font-semibold">
                  QC
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      <div className="flex gap-2 justify-center mt-1">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? "bg-brand-red w-3.5" : "bg-gray-300"
            }`}
            aria-label={`Chuyển đến quảng cáo ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
