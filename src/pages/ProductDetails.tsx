import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productService } from "@/lib/services/productService";
import { Product, formatPrice } from "@/lib/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import RelatedProducts from "@/components/RelatedProducts";
import ReviewSection from "@/components/ReviewSection";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { reviewService } from "@/lib/services/reviewService";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedNote, setSelectedNote] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        if (data) {
          setProduct(data);
          // Initialize selection from product base values
          setSelectedSize(data.size);
          setSelectedPrice(data.price);
          setSelectedImage(data.images[0]);
          if (data.notes && data.notes.length > 0) {
            setSelectedNote(data.notes[0]);
          }

          // If the base product size matches a variant, load that variant's specific image/price if needed
          // But rely on base values first to respect the "Main" display
          if (data.variants && data.variants.length > 0) {
            const matchingVariant = data.variants.find(v => v.size === data.size);
            if (matchingVariant) {
              if (matchingVariant.price) setSelectedPrice(matchingVariant.price);
              if (matchingVariant.image) setSelectedImage(matchingVariant.image);
            }
          }

          // Fetch rating
          const ratingData = await reviewService.getAverageRating(id);
          setAverageRating(ratingData);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleVariantChange = (variant: any) => {
    setSelectedSize(variant.size);
    setSelectedPrice(variant.price);
    if (variant.image) {
      setSelectedImage(variant.image);
    } else {
      // Revert to default main image if variant has no specific image
      setSelectedImage("");
      setActiveImage(0);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart({
        ...product,
        price: selectedPrice,
        size: selectedSize,
        selectedNote: selectedNote,
        images: selectedImage ? [selectedImage, ...product.images.filter(i => i !== selectedImage)] : product.images
      });
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col pt-24 items-center justify-center text-center px-4">
        <h1 className="text-3xl font-heading mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">The fragrance you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button variant="gold" size="lg">Return to Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb / Back button */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column: Image / Carousel */}
            <div className="flex flex-col-reverse lg:flex-row gap-4 lg:h-[600px]">
              {/* Thumbnail strip (Images + Videos) */}
              {(product.images.length > 1 || (product.videos && product.videos.length > 0)) && (
                <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 shrink-0 no-scrollbar py-2 px-1">
                  {/* Images */}
                  {product.images.map((img, index) => (
                    <div
                      key={`img-${index}`}
                      className={`relative w-20 h-20 shrink-0 bg-white border-2 rounded-xl p-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        (selectedImage === img || (!selectedImage && activeImage === index && !product.videos?.includes(selectedImage)))
                          ? 'border-gold shadow-md shadow-gold/10'
                          : 'border-border hover:border-gold/50'
                      }`}
                      onClick={() => { setActiveImage(index); setSelectedImage(img); }}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </div>
                  ))}

                  {/* Videos */}
                  {product.videos?.map((video, index) => {
                    const getYoutubeId = (url: string) => {
                      if (!url) return null;
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                      const match = url.match(regExp);
                      return (match && match[2].length === 11) ? match[2] : null;
                    };
                    const ytId = getYoutubeId(video);
                    const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/default.jpg` : null;

                    return (
                      <div
                        key={`vid-${index}`}
                        className={`relative w-20 h-20 shrink-0 bg-black border-2 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${
                          selectedImage === video
                            ? 'border-gold shadow-md shadow-gold/10'
                            : 'border-border hover:border-gold/50'
                        }`}
                        onClick={() => { setSelectedImage(video); }}
                      >
                        {thumbUrl ? (
                          <img src={thumbUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="w-full h-full bg-neutral-900" />
                        )}

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-6 h-6 rounded-full bg-red-600/90 flex items-center justify-center text-white shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Main Image Display */}
              <div className="flex-1 bg-white rounded-3xl overflow-hidden border border-border shadow-xl shadow-gold/5 flex items-center justify-center h-[500px] lg:h-full relative group">
                {(() => {
                  const currentMedia = selectedImage || product.images[activeImage];
                  // Helper to check for YouTube
                  const getYoutubeId = (url: string) => {
                    if (!url) return null;
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = url.match(regExp);
                    return (match && match[2].length === 11) ? match[2] : null;
                  };

                  const ytId = getYoutubeId(currentMedia);
                  const isVideo = product.videos?.includes(currentMedia);

                  if (isVideo && ytId) {
                    return (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full aspect-[4/3] rounded-2xl"
                      />
                    );
                  } else if (isVideo) {
                    // Fallback for non-YouTube videos (if any remaining)
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl">
                        <p className="text-white">Video format not supported. Please use YouTube.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        key={currentMedia}
                        src={currentMedia}
                        alt={product.name}
                        className="w-full h-full object-contain max-w-full max-h-full transition-all duration-500 group-hover:scale-105 animate-fade-in"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/600x800?text=No+Image";
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Column: Details (Sticky on Desktop) */}
            <div className="lg:sticky lg:top-32 space-y-8 flex flex-col h-full">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] backdrop-blur-sm">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= Math.round(averageRating.average) ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      {averageRating.count} Reviews
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-heading leading-tight text-foreground ">
                    {product.name}
                  </h1>
                  <p className="text-3xl font-medium gold-text-gradient italic">
                    {formatPrice(selectedPrice)}
                  </p>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed border-l-2 border-gold/20 pl-6 italic">
                  "{product.description}"
                </p>



                {/* Size / Specs */}
                <div className="space-y-6 bg-muted/30 p-8 rounded-3xl border border-border/50">
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-gold">Volume</span>

                    {(() => {
                      // Merge base product and variants, deduplicating by size
                      const allOptions = [
                        { size: product.size, price: product.price, image: product.images[0] }, // Base product
                        ...(product.variants || [])
                      ];

                      // Deduplicate by size (keeping the first occurrence - which is base, or explicit variant if it overrides)
                      // Actually, if a variant has same size, we might want its specific details. 
                      // But user wants Base as default. Let's trust Base first for the "Main" concept.
                      const uniqueOptions = Array.from(new Map(allOptions.map(item => [item.size, item])).values());

                      // Sort? Maybe not, keep manual order usually better or base first.

                      return (
                        <div className="flex flex-wrap gap-3">
                          {uniqueOptions.map((variant) => (
                            <button
                              key={variant.size}
                              onClick={() => handleVariantChange(variant)}
                              className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest border-2 transition-all duration-300 ${selectedSize === variant.size
                                ? 'border-gold bg-gold/10 text-gold shadow-md shadow-gold/10'
                                : 'border-border bg-white text-muted-foreground hover:border-gold/50'
                                }`}
                            >
                              {variant.size}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-gold">Olfactory Notes</span>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.map((note, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedNote(note)}
                          className={`px-4 py-2 rounded-xl text-xs font-medium border shadow-sm transition-all duration-300 ${selectedNote === note
                            ? 'bg-gold/10 text-gold border-gold shadow-gold/10'
                            : 'bg-white/50 backdrop-blur-sm text-foreground border-border hover:border-gold/50'
                            }`}
                        >
                          {note}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <div className="flex justify-start pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-gold/20 hover:border-gold/60 text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all duration-500 gap-2 px-6 h-9 tracking-wider text-[10px] font-bold uppercase shadow-sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: `Check out ${product.name} on Puniora!`,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied to clipboard!");
                      }
                    }}
                  >
                    <Share2 className="h-3 w-3" /> Share this fragrance
                  </Button>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden lg:flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    variant="gold"
                    size="xl"
                    className="flex-1 h-14 shadow-xl shadow-gold/20 hover:scale-[1.02] transition-transform"
                    onClick={() => addToCart({ ...product, price: selectedPrice, size: selectedSize, selectedNote: selectedNote, images: [selectedImage, ...product.images.filter(i => i !== selectedImage)] })}
                  >
                    <ShoppingCart className="mr-3 h-5 w-5" />
                    ADD TO CART
                  </Button>
                  <Button
                    variant="luxuryOutline"
                    size="xl"
                    className="flex-1 h-14 border-2"
                    onClick={handleBuyNow}
                  >
                    BUY NOW
                  </Button>
                </div>

                {/* Mobile Action Buttons (Visible only if not stuck) */}
                <div className="lg:hidden flex flex-col gap-4 pt-6">
                  <Button
                    variant="gold"
                    size="xl"
                    className="w-full h-14 shadow-xl shadow-gold/20"
                    onClick={() => addToCart({ ...product, price: selectedPrice, size: selectedSize, selectedNote: selectedNote, images: [selectedImage, ...product.images.filter(i => i !== selectedImage)] })}
                  >
                    <ShoppingCart className="mr-3 h-5 w-5" />
                    ADD TO CART
                  </Button>
                  <Button
                    variant="luxuryOutline"
                    size="xl"
                    className="w-full h-14"
                    onClick={handleBuyNow}
                  >
                    BUY NOW
                  </Button>
                </div>

                {/* Perks/Trust markers */}
                <div className="grid grid-cols-2 gap-y-6 pt-10 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-gold/5 p-2 rounded-lg">
                      <ShieldCheck className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Genuine Product</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gold/5 p-2 rounded-lg">
                      <Truck className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Premium Shipping</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gold/5 p-2 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Easy Returns</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gold/5 p-2 rounded-lg">
                      <Loader2 className="h-5 w-5 text-gold animate-pulse" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Limited Batch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-border/50 p-4 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Price</span>
              <span className="text-lg font-bold text-gold">{formatPrice(product.price)}</span>
            </div>
            <Button
              variant="gold"
              className="flex-1 h-12 shadow-lg shadow-gold/20 font-bold uppercase tracking-widest text-[10px]"
              onClick={() => addToCart({ ...product, price: selectedPrice, size: selectedSize, selectedNote: selectedNote, images: [selectedImage, ...product.images.filter(i => i !== selectedImage)] })}
            >
              Add to Cart
            </Button>
          </div>
        </div>
        {/* Full Width Accordion Section */}
        {product.extraSections && product.extraSections.length > 0 && (
          <div className="container mx-auto px-6 mt-16 mb-24 animate-fade-in" style={{ animationDelay: '200ms' }}>
             <div className="w-full border-t border-gold/20">
                <Accordion type="single" collapsible className="w-full">
                  {product.extraSections.map((section, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-gold/20 py-4">
                      <AccordionTrigger className="text-xl md:text-2xl font-medium uppercase tracking-[0.15em] hover:text-gold hover:no-underline py-6 [&[data-state=open]]:text-gold transition-colors">
                        {section.title}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap px-4 pb-8">
                        {section.content}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
             </div>
          </div>
        )}

        {/* Product Gallery Section (Masonry) - Fallback to main images if gallery is empty */}
        {((product.gallery && product.gallery.length > 0) || (product.images && product.images.length > 0)) && (
          <div className="container mx-auto px-6 mb-24 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-3xl font-heading mb-8 text-center text-gold uppercase tracking-widest">Visual Story</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[300px]">
              {(product.gallery && product.gallery.length > 0 ? product.gallery : product.images).map((img, index) => (
                <div 
                  key={index} 
                  className={`relative rounded-2xl overflow-hidden group cursor-pointer ${
                    index % 5 === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
                  } ${
                     // Add some more variety if we have many images
                     index % 5 === 3 ? "md:col-span-2" : ""
                  }`}
                  onClick={() => { setSelectedImage(img); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${index}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products & Reviews */}
        <div className="container mx-auto px-6 mb-20 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <RelatedProducts currentProductId={product.id} category={product.category} />
          <ReviewSection productId={product.id} />
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetails;
