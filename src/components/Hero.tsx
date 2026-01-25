import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { useEffect, useState } from "react";
import { settingsService } from "@/lib/services/settingsService";
import { getDirectUrl } from "@/lib/utils/imageUtils";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [desktopImages, setDesktopImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Determine active images based on viewport
  const heroImages = (isMobile && mobileImages.length > 0) ? mobileImages : desktopImages;

  useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const [dImages, mImages] = await Promise.all([
             settingsService.getJsonSetting<string[]>("hero_images", []),
             settingsService.getJsonSetting<string[]>("hero_images_mobile", [])
        ]);

        if (dImages && dImages.length > 0) {
          setDesktopImages(dImages);
        }
        
        if (mImages && mImages.length > 0) {
            setMobileImages(mImages);
        }

      } catch (error) {
        console.warn("Failed to fetch hero image settings", error);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    // Reset index if image set changes or length is small
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]); // Re-run when active image set changes

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 pb-24">
      {/* Background with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {heroImages.map((img, index) => (
          <div
            key={`${img}-${index}`} // Unique key for transition
            className={`absolute inset-0 z-0 h-[120%] transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
              zIndex: index === currentIndex ? 1 : 0
            }}
          >
            <img
              src={getDirectUrl(img)}
              alt="Puniora Luxury Perfume Collection"
              className={`w-full h-full object-cover animate-scale-in ${isMobile ? 'object-[center_top]' : 'object-center'}`}
              onError={(e) => {
                console.error("Hero image failed to load:", img);
              }}
            />
          </div>
        ))}
      </div>

      {/* Carousel Indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-gold w-6" : "bg-white/50 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* USP Bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/60 backdrop-blur-xl py-4 overflow-hidden z-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white">
            {[
              "Cruelty-Free",
              "Paraben-Free",
              "25% Parfum Concentration",
              "Handcrafted in India"
            ].map((usp, i) => (
              <div key={usp} className="flex items-center gap-2 shrink-0 opacity-0 animate-fade-in" style={{ animationDelay: `${2.2 + (i * 0.2)}s`, animationFillMode: 'forwards' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(255,85,0,0.8)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/80">{usp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
