import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
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
            className={`absolute inset-0 z-0 h-[120%] transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
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
                 // No fallback as requested
              }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90 z-[2]" />
        <div className="absolute inset-0 bg-black/30 z-[2]" />
      </div>

      {/* Floating Particles/Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/20 rounded-full blur-[100px] animate-pulse-glow z-[3]" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] animate-pulse-glow z-[3]" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="overflow-hidden mb-2">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/90 bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                The Masterpiece Collection
              </span>
            </div>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl lg:text-9xl leading-[1] mb-6 drop-shadow-2xl">
            <span className="block text-white animate-slide-in-right opacity-0 drop-shadow-md" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>Essence of</span>
            <span className="gold-text-gradient italic block animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Every Mood</span>
          </h1>

          <p className="text-white/90 text-sm md:text-xl max-w-lg mx-auto mb-10 leading-relaxed font-light opacity-0 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
            Immerse yourself in a world where every scent tells a story.
            Handcrafted luxury fragrances for the modern soul.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
            <Button
              variant="gold"
              size="xl"
              asChild
              className="min-w-[200px] h-14 text-base font-bold shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-500"
            >
              <a href="#collection">Explore Collection</a>
            </Button>
            <Button
              variant="outline"
              size="xl"
              asChild
              className="min-w-[200px] h-14 text-base bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
            >
              <a href="#about">Our Story</a>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 hidden md:block opacity-0 animate-fade-in" style={{ animationDelay: "2s", animationFillMode: 'forwards' }}>
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 animate-bounce">Scroll Down</span>
            <ArrowDown className="text-gold/80 animate-bounce h-5 w-5" />
          </div>
        </div>

        {/* Carousel Indicators */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-gold w-6" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* USP Bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/60 backdrop-blur-xl py-6 overflow-hidden z-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-white">
            {[
              "Cruelty-Free",
              "Paraben-Free",
              "25% Parfum Concentration",
              "Handcrafted in India"
            ].map((usp, i) => (
              <div key={usp} className="flex items-center gap-3 shrink-0 opacity-0 animate-fade-in" style={{ animationDelay: `${2.2 + (i * 0.2)}s`, animationFillMode: 'forwards' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-white/80">{usp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
