import { useState, useEffect } from "react";
import { reviewService, Review } from "@/lib/services/reviewService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Star, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AdminReviewManagerProps {
  productId: string;
}

const AdminReviewManager = ({ productId }: AdminReviewManagerProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form State
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [customDate, setCustomDate] = useState(""); 

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
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await reviewService.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success("Review deleted");
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleAddReview = async () => {
    if (!userName || !comment) {
      toast.error("Name and Comment are required");
      return;
    }

    try {
      setAdding(true);
      
      const reviewDate = customDate ? new Date(customDate).toISOString() : new Date().toISOString();

      await reviewService.addReview({
        product_id: productId,
        user_name: userName,
        rating,
        comment,
        images: [], // Admin doesn't need to upload fake images usually, keep it simple
        created_at: reviewDate
      });

      toast.success("Review added successfully");
      
      // Reset form
      setUserName("");
      setComment("");
      setRating(5);
      setCustomDate("");
      
      fetchReviews();
    } catch (error) {
      console.error("Failed to add review:", error);
      toast.error("Failed to add review");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="py-4 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /> Loading reviews...</div>;

  return (
    <div className="space-y-8 bg-muted/20 p-6 rounded-xl border border-dashed border-gold/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold uppercase tracking-wider text-gold">Manage Reviews</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border">{reviews.length} Reviews</span>
      </div>

      {/* Add Review Form */}
      <div className="bg-background/50 p-4 rounded-lg border border-border space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Add "Seeded" Review</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Customer Name</Label>
              <Input 
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                placeholder="e.g. Sarah J."
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date (Optional / Backdate)</Label>
              <div className="relative">
                <Input 
                  type="date"
                  value={customDate} 
                  onChange={e => setCustomDate(e.target.value)} 
                  className="h-8 pl-8"
                />
                <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-6 h-6 ${s <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Comment</Label>
            <Textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="e.g. This perfume smells amazing..."
              className="h-20 text-sm"
            />
          </div>

          <Button type="button" size="sm" className="w-full bg-gold hover:bg-gold/90" disabled={adding} onClick={() => handleAddReview()}>
            {adding ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Add Review"}
          </Button>
        </div>
      </div>

      {/* Existing Reviews List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {reviews.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4 italic">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-background p-3 rounded-lg border border-border flex justify-between items-start group hover:border-gold/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <div className="flex">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-gold text-gold" : "text-muted-foreground/20"}`} />)}
                   </div>
                   <span className="text-xs font-bold">{review.user_name}</span>
                   <span className="text-[10px] text-muted-foreground">
                     {format(new Date(review.created_at), "MMM d, yyyy")}
                   </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(review.id)}
                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReviewManager;
