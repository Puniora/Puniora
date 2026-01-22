import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { products as staticProducts, giftSet, formatPrice } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Loader2 } from "lucide-react";
import { productService } from "@/lib/services/productService";
import { Product } from "@/lib/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ProductGrid = () => {
  useScrollReveal();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicProducts = async () => {
      try {
        setLoading(true);
        const dynamicProducts = await productService.getProducts();
        if (dynamicProducts && dynamicProducts.length > 0) {
          setProducts(dynamicProducts.filter(p => !p.isHidden));
        } else {
          // Auto-seed if empty
          console.log("No products found, auto-seeding...");
          const allToSeed = [...staticProducts, { ...giftSet, isGiftSet: true }];
          await productService.seedInitialProducts(allToSeed);

          // Re-fetch after seeding
          const seededProducts = await productService.getProducts();
          setProducts(seededProducts.filter(p => !p.isHidden));
        }
      } catch (error) {
        console.error("Failed to fetch products from Supabase, using static data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicProducts();
  }, []);

  const displayProducts = products.filter(p => !p.isGiftSet);


  return (
    <section id="collection" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll reveal opacity-0">
          <span className="text-xs uppercase tracking-[0.4em] text-gold mb-4 block">
            Our Fragrances
          </span>
          <h2 className="font-heading text-3xl md:text-5xl mb-4">
            The Collection
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Each scent is a masterpiece, crafted with the finest ingredients
            to evoke emotion and create lasting memories.
          </p>
        </div>

        {/* Product Grid */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 mb-24">
            {displayProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
            {!loading && displayProducts.length === 0 && (
              <div className="col-span-full py-24 text-center text-muted-foreground italic border border-dashed border-border/50 rounded-3xl animate-fade-in">
                No fragrances available yet. Add them from the admin panel!
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
