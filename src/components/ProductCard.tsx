import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Product, formatPrice } from "@/lib/products";
import { productService } from "@/lib/services/productService";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getDirectUrl } from "@/lib/utils/imageUtils";

interface ProductCardProps {
  product: Product;
  index: number;
  overrideImages?: string[]; // Optional prop to override display images
}

const ProductCard = ({ product, index, overrideImages }: ProductCardProps) => {
  const { addToCart } = useCart();
  const cardRef = useRef<HTMLElement>(null);

  // Use the custom hook for scroll reveal
  useScrollReveal('animate-reveal');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <article
      ref={cardRef}
      className="group relative opacity-0 reveal bg-[#050505] rounded-[1.5rem] overflow-hidden flex flex-col h-full border border-gold/20 shadow-lg hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:border-gold/50 transition-all duration-500"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link to={`/products/${productService.createSlug(product.name)}`} className="block h-full relative">
        {/* Shine Element */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

        {/* Image Container - Black background to merge with dark product images */}
        <div className="relative aspect-[4/5] bg-[#050505] overflow-hidden">

          {overrideImages && overrideImages.length > 0 ? (
            <div className={`w-full h-full grid ${overrideImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
              {overrideImages.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={getDirectUrl(img)}
                  alt=""
                  className={`w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
                />
              ))}
            </div>
          ) : (
            <img
              src={getDirectUrl(product.images[0])}
              alt={`${product.name} - ${product.category}`}
              className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-all [transition-duration:1.5s] ease-out group-hover:scale-105"
            />
          )}

          {/* Vignette to blend edges if image isn't perfect black */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent opacity-60" />

          {/* Floating Price Tag */}
          <div className="hidden md:block absolute top-4 right-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full z-10 border border-gold/30 shadow-sm group-hover:bg-gold group-hover:text-black transition-colors duration-500">
            <span className="text-white group-hover:text-black font-medium text-xs tracking-widest font-heading">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Quick Add Button (Floating) */}
          <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20 w-[85%]">
            <Button
              className="w-full bg-white text-black hover:bg-gold hover:text-black font-body tracking-[0.2em] text-[10px] uppercase h-10 rounded-full shadow-lg"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">
              {product.category}
            </span>
          </div>
        </div>

        {/* Minimalist Info (Below Image) */}
        <div className="pt-4 pb-4 px-4 md:pt-6 md:pb-6 md:px-6 text-center relative z-10 space-y-1.5 md:space-y-2 bg-[#050505] flex-1 border-t border-white/5">
          <h3 className="font-heading text-lg md:text-2xl text-white group-hover:text-gold transition-colors duration-500 truncate px-2">
            {product.name}
          </h3>
          <div className="w-8 h-px bg-white/20 mx-auto group-hover:w-16 group-hover:bg-gold transition-all duration-500" />
          <p className="text-[9px] md:text-[10px] text-white/40 tracking-[0.2em] md:tracking-[0.3em] uppercase group-hover:text-white/60 transition-colors line-clamp-1 md:line-clamp-none px-2">
            {product.notes.join(" • ")}
          </p>

          {/* Mobile Price/Add */}
          <div className="md:hidden flex items-center justify-center gap-4 pt-2">
            <span className="text-gold font-heading text-base md:text-lg font-bold">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
