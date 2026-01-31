import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { productService } from "@/lib/services/productService";
import { Product } from "@/lib/products";
import { ArrowRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getDirectUrl } from "@/lib/utils/imageUtils";

const FeaturedGiftSet = () => {
    const [giftSet, setGiftSet] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Use scroll reveal for animations - pass loading as trigger so it re-runs when content appears
    useScrollReveal("animate-reveal", 0.1, loading);

    useEffect(() => {
        const fetchFeaturedSet = async () => {
            try {
                const products = await productService.getProducts();

                // Get all valid products for the spotlight
                const validProducts = products.filter(p => !p.isHidden);

                // Fallback: If no "visible" products found (e.g. mapping issue), use ANY product from DB
                // This ensures we show something if data exists, rather than an empty section
                const finalPool = validProducts.length > 0 ? validProducts : products;

                if (finalPool.length === 0) {
                    console.warn("Daily Spotlight: No products found in database.");
                    setGiftSet(null);
                    return;
                }

                // Priority 1: Check for explicitly featured product
                const featuredProduct = finalPool.find(p => p.is_featured);

                if (featuredProduct) {
                    setGiftSet(featuredProduct);
                    return;
                }

                // Priority 2: Fallback to Date-based rotation if no featured product set
                // Simple pseudo-random selection based on the current date (YYYY-MM-DD)
                // This ensures the same product is shown for everyone on the same day
                const today = new Date().toISOString().split('T')[0];
                let seed = 0;
                for (let i = 0; i < today.length; i++) {
                    seed += today.charCodeAt(i);
                }
                
                const randomIndex = seed % finalPool.length;
                const dailySpotlight = finalPool[randomIndex];

                setGiftSet(dailySpotlight);
            } catch (error) {
                console.error("Failed to fetch featured product", error);
                setGiftSet(null);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedSet();
    }, []);

    if (loading || !giftSet) return null;

    const productData = giftSet;
    const displayImage = (productData.images && productData.images.length > 0) ? productData.images[0] : "https://placehold.co/800x600/1a1a1a/e2b16e?text=No+Image";
    
    // Create a truncated description if none exists or it's too long
    const shortDesc = productData.description 
        ? (productData.description.length > 120 ? productData.description.substring(0, 120) + "..." : productData.description)
        : "Experience luxury in every breath with our curated collection.";

    return (
        <section className="bg-[#050505] relative overflow-hidden text-white">

            {/* MOBILE LAYOUT: Cinematic (Block on Mobile, Hidden on LG Screens) */}
            <div className="lg:hidden relative w-full h-[80vh] min-h-[600px] overflow-hidden group">
                <div className="absolute inset-0">
                    <img
                        src={getDirectUrl(displayImage, 1200)}
                        alt={productData.name}
                        width="800"
                        height="1200"
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-full object-cover transition-transform [transition-duration:2000ms] group-hover:scale-105"
                    />
                    {/* Stronger readable gradient at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent opacity-90" />
                </div>

                <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-20">
                    <div className="max-w-xl space-y-4 reveal opacity-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            <span className="text-[10px] font-medium text-white/90 uppercase tracking-widest">Best Seller</span>
                        </div>

                        <h2 className="text-4xl font-heading font-medium leading-[0.9] text-white">
                            Experience <br />
                            <span className="text-transparent bg-clip-text bg-gradient-gold italic font-light">
                                {productData.name.split(' ')[0]}
                            </span>
                        </h2>

                        <p className="text-sm text-white/80 font-light leading-relaxed max-w-xs border-l border-gold/30 pl-4">
                            "{shortDesc}"
                        </p>

                        <div className="flex gap-8 pt-2">
                            <div>
                                <p className="text-xl font-heading text-white">
                                    ₹{productData.price}
                                    {productData.real_price && (
                                        <span className="text-sm text-white/40 line-through ml-2">₹{productData.real_price}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link to={`/products/${productService.createSlug(productData.name)}`}>
                                <Button size="lg" disabled={productData.is_sold_out} className="w-full h-12 bg-white text-black hover:bg-gold hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] mr-2">
                                        {productData.is_sold_out ? "Sold Out" : "Shop Now"}
                                    </span>
                                    {!productData.is_sold_out && <ArrowRight className="w-4 h-4" />}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 animate-bounce">
                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                </div>
            </div>


            {/* DESKTOP LAYOUT: Split Luxury (Hidden on Mobile, Block on LG Screens) */}
            <div className="hidden lg:block py-32 container mx-auto px-6 relative z-10">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full -translate-x-1/2 pointer-events-none text-gold" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    {/* Image Content - Left */}
                    <div className="relative group reveal opacity-0">
                        <div className="absolute inset-0 bg-gold/20 blur-3xl transform scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full" />
                        <div className="relative z-10">
                            <div className="absolute inset-0 border border-white/10 rounded-t-[150px] rounded-b-[20px] translate-x-4 translate-y-4 transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6" />
                            <div 
                                className="relative rounded-t-[150px] rounded-b-[20px] overflow-hidden shadow-2xl shadow-black/50 aspect-[4/5] max-w-md mx-auto"
                                style={{ transform: 'translateZ(0)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10" />
                                <img
                                    src={getDirectUrl(displayImage, 1200)}
                                    alt={productData.name}
                                    width="500"
                                    height="625"
                                    loading="eager"
                                    // @ts-ignore
                                    fetchpriority="high"
                                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105 will-change-transform"
                                />
                                <div className="absolute bottom-8 left-8 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg hover:bg-white/20 transition-colors cursor-default">
                                    <span className="h-2 w-2 rounded-full bg-gold animate-pulse-glow" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/90">Best Seller</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content - Right */}
                    <div className="space-y-10 reveal opacity-0" style={{ animationDelay: '0.2s' }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 border-b border-gold/50 text-gold text-xs font-bold uppercase tracking-[0.3em]">
                            Best Seller
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-6xl lg:text-7xl font-heading leading-tight text-white/95">
                                Experience <br />
                                <span className="text-transparent bg-clip-text bg-gradient-gold italic pr-4">
                                    {productData.name}
                                </span>
                            </h2>
                            <p className="text-white/60 text-lg leading-relaxed max-w-lg font-light tracking-wide">
                                "{shortDesc}"
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
                            <Link to={`/products/${productService.createSlug(productData.name)}`}>
                                <Button size="xl" disabled={productData.is_sold_out} className="bg-white text-black hover:bg-gold hover:text-black hover:scale-105 transition-all duration-500 h-14 px-10 rounded-none border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] mr-2">
                                        {productData.is_sold_out ? "Sold Out" : "Shop Now"}
                                    </span>
                                    {!productData.is_sold_out && <ArrowRight className="h-4 w-4" />}
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                            <div className="space-y-1">
                                <h4 className="text-gold font-heading text-lg">₹{productData.price}</h4>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Limited Time</p>
                            </div>
                             <div className="space-y-1">
                                <h4 className="text-white font-heading text-lg">{productData.category}</h4>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Category</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedGiftSet;
