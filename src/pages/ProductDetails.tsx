import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productService } from "@/lib/services/productService";
import { Product, formatPrice } from "@/lib/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
import { Loader2, ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RefreshCw, Share2, CreditCard, Banknote, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { getDirectUrl } from "@/lib/utils/imageUtils";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

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
  const [bundleImages, setBundleImages] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        if (data && !data.isHidden) {
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

          // Fetch bundle items if this is a gift set with no images (or placeholder)
          if (data.isGiftSet && (!data.images || data.images.length === 0 || (data.images.length === 1 && !data.images[0]))) {
            if (data.bundleItems && data.bundleItems.length > 0) {
              // We need to fetch these items. Since we don't have getProductsByIds, we'll fetch all or use getProductById in parallel
              // Fetching all is safer for caching + simpler if count is low (<100 products), but parallel individual fetch is also fine for small bundles.
              // Let's use getProductById in parallel for efficiency if we assume they are not already cached heavily.
              // Actually, productService doesn't expose cache directly, so let's do parallel requests.
              const bundlePromises = data.bundleItems.map(bId => productService.getProductById(bId));
              const bundleResults = await Promise.all(bundlePromises);
              const validImages = bundleResults
                .filter(p => p !== null)
                .map(p => p!.images[0])
                .filter(Boolean);

              if (validImages.length > 0) {
                setBundleImages(validImages);
              }
            }
          }
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

      <main className="pt-32 md:pt-40 pb-24 overflow-x-hidden w-full max-w-[100vw]">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb / Back button */}
          <RevealOnScroll variant="fade-in" delay={100}>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-4 lg:mb-8 group">
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
              Back to Collection
            </Link>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Column: Image / Carousel */}
            <RevealOnScroll variant="fade-up" delay={200} className="w-full">
            <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
              {/* Thumbnail strip (Images + Videos) */}
              {(product.images.length > 1 || (product.videos && product.videos.length > 0)) && (
                <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 shrink-0 no-scrollbar py-2 px-1 w-full lg:w-auto lg:h-[600px]">
                  {/* Images */}
                  {product.images.map((img, index) => (
                    <div
                      key={`img-${index}`}
                      className={`relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 bg-white border-2 rounded-xl p-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${(selectedImage === img || (!selectedImage && activeImage === index && !product.videos?.includes(selectedImage)))
                        ? 'border-gold shadow-md shadow-gold/10'
                        : 'border-border hover:border-gold/50'
                        }`}
                      onClick={() => { setActiveImage(index); setSelectedImage(img); }}
                    >
                      <img src={getDirectUrl(img)} alt="" className="w-full h-full object-contain" />
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
                        className={`relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 bg-black border-2 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${selectedImage === video
                          ? 'border-gold shadow-md shadow-gold/10'
                          : 'border-border hover:border-gold/50'
                          }`}
                        onClick={() => { setSelectedImage(video); }}
                      >
                        {thumbUrl ? (
                          <img src={getDirectUrl(thumbUrl)} alt="Video thumbnail" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
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
              <div className="flex-1 w-full bg-white rounded-3xl overflow-hidden border border-border shadow-xl shadow-gold/5 flex items-center justify-center aspect-square md:aspect-[4/3] lg:h-[600px] lg:aspect-auto relative group">
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
                        className="w-full h-full rounded-2xl"
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

                  // If we have bundle items but no specific selected image, show grid
                  if (bundleImages.length > 0 && !selectedImage && activeImage === 0 && (!product.images || product.images.length <= 1)) {
                    return (
                      <div className={`w-full h-full grid ${bundleImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                        {bundleImages.slice(0, 4).map((img, idx) => (
                          <img
                            key={idx}
                            src={getDirectUrl(img)}
                            alt=""
                            className={`w-full h-full object-cover border-white/50
                                   ${bundleImages.length === 2 && idx === 0 ? 'border-r' : ''}
                                   ${bundleImages.length > 2 && idx === 0 ? 'border-r border-b' : ''}
                                   ${bundleImages.length > 2 && idx === 1 ? 'border-l border-b' : ''}
                                   ${bundleImages.length > 2 && idx === 2 ? 'border-r border-t' : ''}
                                   ${bundleImages.length > 2 && idx === 3 ? 'border-l border-t' : ''}
                                   ${bundleImages.length === 3 && idx === 2 ? 'col-span-2 border-r-0' : ''} 
                                 `}
                          />
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                      <img
                        key={currentMedia}
                        src={getDirectUrl(currentMedia)}
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
            </RevealOnScroll>

            {/* Right Column: Details (Sticky on Desktop) */}
            <div className="lg:sticky lg:top-36 space-y-6 lg:space-y-8 flex flex-col h-full">
              <RevealOnScroll variant="slide-left" delay={300}>
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
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading leading-tight text-foreground break-words">
                    {product.name}
                  </h1>
                  <p className="text-3xl font-medium gold-text-gradient italic">
                    {formatPrice(selectedPrice)}
                  </p>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed border-l-2 border-gold/20 pl-6 italic break-words max-w-full overflow-hidden">
                  "{product.description}"
                </p>



                  <div className="space-y-6 bg-muted/30 p-6 md:p-8 rounded-3xl border border-border/50">
                    <div className="flex flex-col gap-4">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-gold">Volume</span>

                      {(() => {
                        const allOptions = [
                          { size: product.size, price: product.price, image: product.images[0] },
                          ...(product.variants || [])
                        ];
                        const uniqueOptions = Array.from(new Map(allOptions.map(item => [item.size, item])).values());

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
                      <div className="grid grid-cols-3 gap-3 md:flex md:flex-wrap md:gap-4">
                        {(product.olfactoryNotes && product.olfactoryNotes.length > 0) ? (
                          product.olfactoryNotes.map((note, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedNote(selectedNote === note.name ? "" : note.name)}
                              className={`group relative flex flex-col items-center gap-2 p-2 md:p-3 rounded-xl border transition-all duration-300 w-full md:w-24 ${selectedNote === note.name
                                ? 'bg-gold/10 text-gold border-gold shadow-md shadow-gold/10 ring-1 ring-gold/20'
                                : 'bg-white/50 backdrop-blur-sm text-foreground border-border hover:border-gold/50 hover:bg-gold/5'
                                }`}
                            >
                              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 shrink-0 transition-colors ${selectedNote === note.name ? 'border-gold' : 'border-white shadow-sm'}`}>
                                {note.image ? (
                                  <img src={getDirectUrl(note.image)} className="w-full h-full object-cover" alt={note.name} />
                                ) : (
                                  <div className="w-full h-full bg-gold/20 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                    NOTE
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-center leading-tight break-words w-full">{note.name}</span>
                            </button>
                          ))
                        ) : (
                          product.notes.map((note, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedNote(selectedNote === note ? "" : note)}
                              className={`px-4 py-2 rounded-xl text-xs font-medium border shadow-sm transition-all duration-300 ${selectedNote === note
                                ? 'bg-gold/10 text-gold border-gold shadow-gold/10'
                                : 'bg-white/50 backdrop-blur-sm text-foreground border-border hover:border-gold/50'
                                }`}
                            >
                              {note}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                {/* Share Button */}
                <div className="flex justify-start pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="rounded-full border-gold/20 hover:border-gold/60 text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all duration-500 gap-2 px-6 h-9 tracking-wider text-[10px] font-bold uppercase shadow-sm"
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: product.name,
                            url: window.location.href,
                          });
                        } else {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied to clipboard!");
                        }
                      } catch (error) {
                         console.error("Share failed/cancelled", error);
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
                <div className="flex flex-wrap justify-between gap-y-6 pt-10 border-t border-border/50">
                  <div className="flex flex-col items-center gap-2 text-center w-20 sm:w-24">
                    <div className="bg-gold/5 p-3 rounded-full">
                      <ShieldCheck className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Secure Transaction</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center w-20 sm:w-24">
                    <div className="bg-gold/5 p-3 rounded-full">
                      <Banknote className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Pay on Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center w-20 sm:w-24">
                    <div className="bg-gold/5 p-3 rounded-full">
                      <MapPin className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Easy Tracking</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center w-20 sm:w-24">
                    <div className="bg-gold/5 p-3 rounded-full">
                      <Truck className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Free Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center w-20 sm:w-24">
                    <div className="bg-gold/5 p-3 rounded-full">
                      <Clock className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">24 Hours Shipment</span>
                  </div>
                </div>
              </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-border/50 p-4 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Price</span>
              <span className="text-xl font-heading text-gold">{formatPrice(product.price)}</span>
            </div>
            <Button
              variant="gold"
              className="flex-1 h-12 rounded-full shadow-lg shadow-gold/20 font-bold uppercase tracking-[0.2em] text-[10px] bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-white border-none"
              onClick={() => addToCart({ ...product, price: selectedPrice, size: selectedSize, selectedNote: selectedNote, images: [selectedImage, ...product.images.filter(i => i !== selectedImage)] })}
            >
              Add to Cart
            </Button>
          </div>
        </div>
        {/* Full Width Accordion Section */}
        {product.extraSections && product.extraSections.length > 0 && (
          <div className="container mx-auto px-6 mt-32 mb-24">
            <RevealOnScroll>
            <div className="w-full border-t border-gold/20">
              <Accordion type="single" collapsible className="w-full" defaultValue={product.olfactoryNotes && product.olfactoryNotes.length > 0 ? "olfactory-notes" : undefined}>

                {/* Olfactory Notes Section (Default Open) */}
                {product.olfactoryNotes && product.olfactoryNotes.length > 0 && (
                  <AccordionItem value="olfactory-notes" className="border-b border-gold/20 py-4">
                    <AccordionTrigger className="text-xl md:text-2xl font-medium uppercase tracking-[0.15em] hover:text-gold hover:no-underline py-6 [&[data-state=open]]:text-gold transition-colors">
                      Olfactory Notes
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-lg leading-relaxed px-4 pb-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                        {product.olfactoryNotes.map((note, idx) => (
                          <div key={idx} className="flex flex-col items-center text-center space-y-4 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="w-32 h-32 md:w-40 md:h-40 relative">
                              <img src={getDirectUrl(note.image)} alt={note.name} className="w-full h-full object-contain drop-shadow-md" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-heading text-lg font-bold uppercase tracking-widest text-[#5e4b35]">{note.name}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed italic max-w-xs mx-auto">
                                {note.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

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
            </RevealOnScroll>
          </div>
        )}

        {/* Product Gallery Section (Masonry) - Fallback to main images if gallery is empty */}
        {((product.gallery && product.gallery.length > 0) || (product.images && product.images.length > 0)) && (
          <div className="container mx-auto px-6 mt-32 mb-24">
            <RevealOnScroll variant="fade-up">
            <h2 className="text-3xl font-heading mb-8 text-center text-gold uppercase tracking-widest">Visual Story</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[300px]">
              {(product.gallery && product.gallery.length > 0 ? product.gallery : product.images).map((img, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl overflow-hidden group cursor-pointer ${index % 5 === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
                    } ${
                    // Add some more variety if we have many images
                    index % 5 === 3 ? "md:col-span-2" : ""
                    }`}
                  onClick={() => { setSelectedImage(img); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <img
                    src={getDirectUrl(img)}
                    alt={`Gallery ${index}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>
              ))}
            </div>
            </RevealOnScroll>
          </div>
        )}

        {/* Related Products & Reviews */}
        <div className="container mx-auto px-6 mb-20 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <RevealOnScroll>
            <RelatedProducts currentProductId={product.id} category={product.category} />
          </RevealOnScroll> 
          <RevealOnScroll variant="fade-up" delay={200}>
            <ReviewSection productId={product.id} />
          </RevealOnScroll>
        </div>
      </main>

      <Footer />

    </div>
  );
};

export default ProductDetails;
