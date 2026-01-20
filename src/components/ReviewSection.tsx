import { useState, useEffect } from "react";
import { Star, StarOff, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { reviewService, Review } from "@/lib/services/reviewService";
import { productService } from "@/lib/services/productService";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { getDirectUrl } from "@/lib/utils/imageUtils";

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      // Upload images if any
      const imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const url = await productService.uploadImage(file);
          imageUrls.push(url);
        }
      }

      await reviewService.addReview({
        product_id: productId,
        user_name: userName,
        rating,
        comment,
        images: imageUrls,
      });

      toast.success("Review submitted successfully");
      setUserName("");
      setComment("");
      setRating(5);
      setImageFiles([]);
      setImagePreviews([]);
      fetchReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 border-t border-border/50">
      <div className="grid lg:grid-cols-3 gap-16">
        {/* Left: Review Summary & Form */}
        <div className="lg:col-span-1 space-y-10">
          <div className="glass p-8 rounded-3xl shadow-xl shadow-gold/5">
            <h2 className="text-3xl font-heading mb-6">Customer Reviews</h2>
            <div className="flex items-center gap-6">
              <div className="text-6xl font-bold gold-text-gradient">
                {reviews.length > 0
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : "0"}
              </div>
              <div className="space-y-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-gold text-gold' : 'text-muted-foreground/20'}`}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Based on {reviews.length} reviews</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-muted/20 p-8 rounded-3xl border border-border/50 backdrop-blur-sm">
            <h3 className="font-heading text-2xl">Share Your Experience</h3>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all hover:scale-125 p-1"
                  >
                    <Star
                      className={`h-8 w-8 ${(hoverRating || rating) >= s ? 'fill-gold text-gold shadow-gold' : 'text-muted-foreground/30'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName" className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Your Name</Label>
              <Input
                id="userName"
                placeholder="How should we address you?"
                className="h-12 bg-white/50 border-border/50 focus:border-gold rounded-xl px-4 italic"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Review</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this fragrance..."
                className="min-h-[100px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Add Photos (Optional)</Label>
              <div className="grid grid-cols-4 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 4 && (
                  <label className="flex items-center justify-center aspect-square border border-dashed border-muted-foreground/30 rounded-md cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Post Review"}
            </Button>
          </form>
        </div>

        {/* Right: Review List */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed flex flex-col items-center">
              <StarOff className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="animate-fade-in group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= review.rating ? 'fill-gold text-gold' : 'text-muted-foreground/20'}`}
                          />
                        ))}
                      </div>
                      <h4 className="font-semibold text-lg">{review.user_name}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {review.comment}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border cursor-pointer hover:border-gold transition-colors">
                          <img src={getDirectUrl(img)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator className="mt-8" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
