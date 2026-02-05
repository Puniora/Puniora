import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { products as staticProducts, giftSet, formatPrice } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Loader2, ChevronDown, Check, SlidersHorizontal, X } from "lucide-react";
import { productService } from "@/lib/services/productService";
import { Product } from "@/lib/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

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

  // Filter State
  const [activeCategory, setActiveCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("featured");
  // Sorting Options
  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Price, low to high", value: "price-asc" },
    { label: "Price, high to low", value: "price-desc" },
    { label: "Date, old to new", value: "date-asc" },
    { label: "Date, new to old", value: "date-desc" },
  ];

  // Logic
  const filteredProducts = products.filter(p => {
    // Category Filter
    let categoryMatch = true;
    if (activeCategory === "Gift Sets") categoryMatch = p.isGiftSet;
    else if (activeCategory === "Men") categoryMatch = p.category === "Men" || p.category === "Unisex";
    else if (activeCategory === "Women") categoryMatch = p.category === "Women" || p.category === "Unisex";
    else if (activeCategory === "Unisex") categoryMatch = p.category === "Unisex";
    else if (activeCategory !== "All") categoryMatch = p.category === activeCategory;

    // Price Filter
    const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];

    return categoryMatch && priceMatch;
  });

  const displayProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "date-asc": return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case "date-desc": return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default: return 0; // Featured (default order)
    }
  });

  const categories = ["All", "Men", "Women", "Unisex", "Gift Sets"];

  return (
    <section id="collection" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 animate-on-scroll reveal opacity-0">
          <span className="text-xs uppercase tracking-[0.4em] text-gold mb-4 block">
            Our Fragrances
          </span>
          <h2 className="font-heading text-3xl md:text-5xl mb-4">
            The Collection
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Each scent is a masterpiece, crafted with the finest ingredients
            to evoke emotion and create lasting memories.
          </p>
          
          {/* Filter & Sort Bar (Bella Vita Style) */}
          <div className="flex flex-row items-center justify-between gap-4 max-w-4xl mx-auto border-b border-white/10 pb-4 mb-8">
             
             {/* LEFT: Filter Button (Opens Sheet) */}
             <Sheet>
                <SheetTrigger asChild>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex-1 md:flex-none justify-center">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filter
                    </button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#050505] border-r border-white/10 w-[300px] md:w-[400px]">
                    <SheetHeader className="pb-6 border-b border-white/10 text-left">
                        <SheetTitle className="text-white font-heading text-2xl">Filters</SheetTitle>
                    </SheetHeader>
                    
                    <div className="py-6 space-y-8">
                        {/* Sort Options */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gold uppercase tracking-wider">Sort By</h4>
                            <div className="flex flex-col gap-2">
                                {sortOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className={`flex items-center justify-between px-4 py-3 text-xs border rounded-lg transition-all ${
                                            sortBy === option.value 
                                            ? "bg-gold/10 text-gold border-gold font-bold" 
                                            : "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        <span>{option.label}</span>
                                        {sortBy === option.value && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-white/80">
                                <h4 className="font-bold text-gold uppercase tracking-wider">Price Range</h4>
                                <span>₹{priceRange[0]} - ₹{priceRange[1]}+</span>
                            </div>
                            <Slider
                                defaultValue={[0, 5000]}
                                max={5000}
                                step={100}
                                value={priceRange}
                                onValueChange={setPriceRange}
                                className="py-4"
                            />
                        </div>
                    </div>
                </SheetContent>
             </Sheet>

             {/* RIGHT: Browse Dropdown */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex-1 md:flex-none justify-center md:min-w-[200px] justify-between">
                    <span>
                         {activeCategory === "All" ? "Shop All" : activeCategory} 
                    </span>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px] bg-black/95 backdrop-blur-xl border border-white/10 text-white p-2 rounded-none shadow-2xl max-h-[80vh] overflow-y-auto">
                    
                    {/* Categories Section */}
                    <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-white/40 tracking-widest">
                        Browse Collection
                    </div>
                    {categories.map(cat => (
                        <DropdownMenuItem 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                cursor-pointer px-4 py-3 text-xs uppercase tracking-wider hover:bg-white/10 focus:bg-white/10 mb-1 rounded-md
                                ${activeCategory === cat ? 'bg-white/10 text-gold font-bold' : 'text-white/80'}
                            `}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span>{cat}</span>
                                {activeCategory === cat && <Check className="w-3.5 h-3.5 text-gold" />}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
             </DropdownMenu>

          </div>
          
          <div className="flex justify-between items-center text-xs text-white/40 uppercase tracking-widest mb-4 px-2">
             <span>{filteredProducts.length} Products</span>
             {activeCategory !== "All" && (
                <button onClick={() => { setActiveCategory("All"); setPriceRange([0, 5000]); }} className="text-gold hover:underline">
                    Clear Filters
                </button>
             )}
          </div>
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
                No fragrances found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
