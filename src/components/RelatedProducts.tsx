import { useState, useEffect } from "react";
import { Product } from "@/lib/products";
import { productService } from "@/lib/services/productService";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const allProducts = await productService.getProducts();
        // Filter by category and exclude current product
        const filtered = allProducts
          .filter(p => p.category === category && p.id !== currentProductId && !p.isHidden)
          .slice(0, 4);
        
        // If not enough products in same category, add some more
        if (filtered.length < 4) {
          const others = allProducts
            .filter(p => p.id !== currentProductId && !filtered.find(f => f.id === p.id) && !p.isHidden)
            .slice(0, 4 - filtered.length);
          setRelated([...filtered, ...others]);
        } else {
          setRelated(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProductId, category]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className="py-16 border-t border-border">
      <h2 className="text-3xl font-heading mb-10">You May Also Like</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {related.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
