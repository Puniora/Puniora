import { useState, useEffect } from "react";
import { productService } from "@/lib/services/productService";
import { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

const GiftSetsGrid = () => {
  const [giftSets, setGiftSets] = useState<{ product: Product; bundleImages?: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiftSets = async () => {
      try {
        setLoading(true);
        const allProducts = await productService.getProducts();
        const sets = allProducts.filter(p => p.isGiftSet && !p.isHidden);
        
        // Prepare display data
        const setsWithImages = sets.map(set => {
           let bundleImages: string[] | undefined = undefined;
           
           // If no main image (or just one which might be placeholder/broken), try to get bundle item images
           // Actually, let's prioritize bundle items if main image is not "official" or we want to show collection
           // User request: "if the admin didnt add a n image url for that gift"
           
           if (!set.images || set.images.length === 0 || (set.images.length === 1 && !set.images[0])) {
               if (set.bundleItems && set.bundleItems.length > 0) {
                   // Find products in bundle
                   const items = allProducts.filter(p => set.bundleItems?.includes(p.id));
                   // Get first image of each item
                   bundleImages = items.map(i => i.images[0]).filter(Boolean);
               }
           }
           
           return { product: set, bundleImages };
        });

        setGiftSets(setsWithImages);
      } catch (error) {
        console.error("Failed to fetch gift sets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiftSets();
  }, []);

  if (loading) return null;
  if (giftSets.length === 0) return null;

  return (
    <section className="py-24 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <span className="text-xs uppercase tracking-[0.4em] text-gold mb-4 block">
            Curated Collections
          </span>
          <h2 className="font-heading text-3xl md:text-5xl mb-4 text-[#5e4b35]">
            Gift Bundles
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto italic">
            Perfectly paired fragrances for yourself or someone special.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {giftSets.map((item, index) => (
            <ProductCard 
               key={item.product.id} 
               product={item.product} 
               index={index} 
               overrideImages={item.bundleImages}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GiftSetsGrid;
