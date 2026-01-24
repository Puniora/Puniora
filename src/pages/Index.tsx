import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import FeaturedGiftSet from "@/components/FeaturedGiftSet";
import Footer from "@/components/Footer";

import { SEO } from "@/components/SEO";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

const Index = () => {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Subtle Grain Overlay for Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.4] mix-blend-multiply">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" />
      </div>

      <div className="relative z-10">
        <Header />
        <RevealOnScroll variant="fade-in" duration={1000}>
          <Hero />
        </RevealOnScroll>
        
        <RevealOnScroll variant="fade-up" delay={200}>
           <ProductGrid />
        </RevealOnScroll>

        <RevealOnScroll variant="scale-up" threshold={0.2} delay={100}>
          <FeaturedGiftSet />
        </RevealOnScroll>
        
        <Footer />

        <SEO
          title="Home"
          description="Discover luxury fragrances at Puniora. Shop our exclusive collection of perfumes, attars, and incense."
        />
      </div>
    </main>
  );
};

export default Index;
