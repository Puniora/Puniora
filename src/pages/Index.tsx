import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import GiftSetsGrid from "@/components/GiftSetsGrid";
import About from "@/components/About";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProductGrid />
      <GiftSetsGrid />
      <About />
      <Footer />
      <CartDrawer />
      <SEO
        title="Home"
        description="Discover luxury fragrances at Puniora. Shop our exclusive collection of perfumes, attars, and incense."
      />
    </main>
  );
};

export default Index;
