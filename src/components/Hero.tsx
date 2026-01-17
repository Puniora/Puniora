import { useEffect, useState } from "react";
import { settingsService } from "@/lib/services/settingsService";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>([]); // Start empty, don't show default
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        console.log("Hero: Fetching settings...");
        const images = await settingsService.getJsonSetting<string[]>("hero_images", []);
        console.log("Hero: Fetched images:", images);

        if (images && images.length > 0) {
          console.log("Hero: Setting new images state");
          setHeroImages(images);
        } else {
          // If DB is empty, maybe we show nothing? Or keep logic? 
          // User said "only show the image in the db".
          // If DB is empty, let's leave it empty.
          console.log("Hero: No images in DB.");
        }
      } catch (error) {
        console.warn("Failed to fetch hero image settings", error);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // If no images, render placeholder or just background?
  // Let's render background with no image loop if empty.

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {heroImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 z-0 h-[120%] transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
              zIndex: index === currentIndex ? 1 : 0
            }}
          >
            <img
              src={img}
              alt="Puniora Luxury Perfume Collection"
              className="w-full h-full object-cover animate-scale-in"
              onError={(e) => {
                console.error("Hero image failed to load:", img);
              }}
            />
          </div>
        ))}
      </div>

      {/* Carousel Indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
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
    </section>
  );
};

export default Hero;
