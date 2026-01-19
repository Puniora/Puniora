import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Product, formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index: number;
  overrideImages?: string[]; // Optional prop to override display images
}

const ProductCard = ({ product, index, overrideImages }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <article
      className="group relative animate-fade-in-up bg-white rounded-3xl overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-gold/20 border border-transparent hover:border-gold/30 flex flex-col h-full"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <Link to={`/product/${product.id}`} className="block h-full relative">
        {/* Image Container */}
          {/* Image Container */}
          <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
            <div className="absolute inset-0 bg-gold/5 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500" />
            
            {overrideImages && overrideImages.length > 0 ? (
                 // Grid Layout
                 <div className={`w-full h-full grid ${overrideImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                    {overrideImages.slice(0, 4).map((img, idx) => (
                       <img 
                         key={idx}
                         src={img} 
                         alt="" 
                         className={`w-full h-full object-cover border-white/50
                           ${overrideImages.length === 2 && idx === 0 ? 'border-r' : ''}
                           ${overrideImages.length > 2 && idx === 0 ? 'border-r border-b' : ''}
                           ${overrideImages.length > 2 && idx === 1 ? 'border-l border-b' : ''}
                           ${overrideImages.length > 2 && idx === 2 ? 'border-r border-t' : ''}
                           ${overrideImages.length > 2 && idx === 3 ? 'border-l border-t' : ''}
                           ${overrideImages.length === 3 && idx === 2 ? 'col-span-2 border-r-0' : ''} 
                         `}
                       />
                    ))}
                 </div>
            ) : (
                <img
                  src={product.images[0]}
                  alt={`${product.name} - ${product.category}`}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 group-hover:rotate-1"
                />
            )}

            {/* Glass Overlay Price (Desktop) */}
            <div className="hidden md:block absolute top-4 right-4 glass px-4 py-2 rounded-full shadow-lg z-10 transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-white group-hover:text-gold border border-white/20">
              <span className="text-foreground group-hover:text-gold font-bold text-xs uppercase tracking-widest">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Quick Add Button (Desktop) */}
            <div className="hidden md:block absolute inset-x-6 bottom-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20">
              <Button
                variant="gold"
                className="w-full shadow-lg shadow-gold/30 font-heading tracking-widest text-xs h-12 uppercase"
                onClick={handleAddToCart}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Collection
              </Button>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 left-4 glass-dark px-3 py-1.5 shadow-lg rounded-full backdrop-blur-md border border-white/10">
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/90">
                {product.category}
              </span>
            </div>
          </div>

        {/* Product Info */}
        <div className="p-5 md:p-6 space-y-3 bg-white flex-1 flex flex-col justify-between relative z-10">
          <div className="space-y-1.5">
            <h3 className="font-heading text-xl md:text-2xl text-foreground group-hover:text-gold transition-colors duration-500 line-clamp-1">
              {product.name}
            </h3>
            <div className="h-px w-10 bg-gold/30 group-hover:w-full transition-all duration-700 ease-out" />
            <p className="text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase line-clamp-1 italic pt-1">
              {product.notes.join(" • ")}
            </p>
          </div>

          {/* Mobile-only layout refinement */}
          <div className="flex md:hidden items-center justify-between pt-3 border-t border-muted/50 mt-2">
            <span className="text-gold font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            <Button
              variant="gold"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg shadow-gold/20 active:scale-95 transition-transform"
              onClick={handleAddToCart}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
