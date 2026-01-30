import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { productService } from "@/lib/services/productService";
import { Product, giftSet as defaultGiftSet } from "@/lib/products";
import { ArrowRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { toast } from "sonner";
import { getDirectUrl } from "@/lib/utils/imageUtils";

const FeaturedGiftSet = () => {
    const [giftSet, setGiftSet] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Use scroll reveal for animations
    useScrollReveal("animate-reveal");

    useEffect(() => {
        const fetchFeaturedSet = async () => {
            try {
                const products = await productService.getProducts();

                // Find the first available gift set that is not hidden
                let set = products.find(p => p.isGiftSet && !p.isHidden);

                // If no gift set exists in the DB, let's seed the default one for the user
                if (!set) {
                    console.log("No gift set found, seeding default...");
                    try {
                        // Remove ID to let DB generate one (or use the string if your DB allows text IDs)
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id, ...setBytes } = defaultGiftSet;
                        set = await productService.addProduct(setBytes);
                        toast.success("Default Gift Set added to catalog");
                    } catch (seedError) {
                        console.error("Failed to seed gift set:", seedError);
                        // Fallback to local object just for display if DB write fails (e.g. auth)
                        set = { ...defaultGiftSet, id: 'temp-preview' };
                    }
                }

                setGiftSet(set || null);
            } catch (error) {
                console.error("Failed to fetch featured gift set", error);
                // Fallback for visual preview even if everything fails
                setGiftSet({ ...defaultGiftSet, id: 'temp-fail-preview' });
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedSet();
    }, []);

    const hasData = giftSet || defaultGiftSet;
    const displayImage = (hasData.images && hasData.images.length > 0) ? hasData.images[0] : "https://placehold.co/800x600/1a1a1a/e2b16e?text=Signature+Collection";
    const productData = giftSet || defaultGiftSet;

    return (
        <section className="bg-[#050505] relative overflow-hidden text-white">

            {/* MOBILE LAYOUT: Cinematic (Block on Mobile, Hidden on LG Screens) */}
            <div className="lg:hidden relative w-full h-[85vh] min-h-[600px] overflow-hidden group">
                <div className="absolute inset-0">
                    <img
                        src={getDirectUrl(displayImage, 1200)}
                        alt={productData.name}
                        width="800"
                        height="1200"
                        loading="eager"
                        fetchPriority="high"
                        className="w-full h-full object-cover transition-transform [transition-duration:2000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
                </div>

                <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
                    <div className="max-w-xl space-y-8 reveal opacity-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            <span className="text-xs font-medium text-white/90 uppercase tracking-widest">Discovery Set</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-heading font-medium leading-[0.9] text-white">
                            Experience <br />
                            <span className="text-transparent bg-clip-text bg-gradient-gold italic font-light">
                                Our Best
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-md border-l border-gold/30 pl-6">
                            "Embark on a sensory journey. Our finest 20ml perfumes, curated to help you find your perfect signature scent."
                        </p>

                        <div className="flex gap-8 pt-4">
                            <div>
                                <p className="text-2xl font-heading text-white">20<span className="text-sm align-top ml-0.5">ml each</span></p>
                                <p className="text-[10px] uppercase tracking-wider text-white/50">Bottles</p>
                            </div>
                        </div>

                        <div className="pt-8">
                            <Link to={`/products/${productService.createSlug(productData.name)}`}>
                                <Button size="xl" className="h-16 px-12 bg-white text-black hover:bg-gold hover:text-black rounded-none transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                                    <span className="text-sm font-bold uppercase tracking-[0.2em] mr-4">Get The Set</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 animate-bounce">
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
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
                            <div className="relative rounded-t-[150px] rounded-b-[20px] overflow-hidden shadow-2xl shadow-black/50 aspect-[4/5] max-w-md mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10" />
                                <img
                                    src={getDirectUrl(displayImage, 1200)}
                                    alt={productData.name}
                                    width="500"
                                    height="625"
                                    loading="eager"
                                    fetchPriority="high"
                                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute bottom-8 left-8 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg hover:bg-white/20 transition-colors cursor-default">
                                    <span className="h-2 w-2 rounded-full bg-gold animate-pulse-glow" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/90">Discovery Set</span>
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
                                    Our Best
                                </span>
                            </h2>
                            <p className="text-white/60 text-lg leading-relaxed max-w-lg font-light tracking-wide">
                                "Embark on a sensory journey. Our finest 20ml perfumes, curated to help you find your perfect signature scent."
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
                            <Link to={`/products/${productService.createSlug(productData.name)}`}>
                                <Button size="xl" className="bg-white text-black hover:bg-gold hover:text-black hover:scale-105 transition-all duration-500 h-14 px-10 rounded-none border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] mr-2">Get The Set</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                            <div className="space-y-1">
                                <h4 className="text-gold font-heading text-lg">20ml each</h4>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Travel Friendly</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedGiftSet;
