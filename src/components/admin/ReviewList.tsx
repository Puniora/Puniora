import { useState } from "react";
import { Link } from "react-router-dom";
import { Review, reviewService } from "@/lib/services/reviewService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReviewListProps {
  reviews: (Review & { product_name?: string })[];
  loading: boolean;
  onRefresh: () => void;
}

const ReviewList = ({ reviews, loading, onRefresh }: ReviewListProps) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeleteReview = async (id: string) => {
    try {
      setDeleting(id);
      await reviewService.deleteReview(id);
      toast.success("Review deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground italic border border-dashed rounded-xl border-border/50 bg-muted/20">
        No reviews found yet.
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Date</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Product</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">User</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Rating</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Comment</TableHead>
            <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id} className="group border-border/50 hover:bg-muted/30 transition-colors">
              <TableCell className="text-sm whitespace-nowrap">
                {new Date(review.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <Link to={`/product/${review.product_id}`} className="font-medium text-sm text-foreground hover:text-gold hover:underline transition-colors w-full">
                  {review.product_name || "Unknown Product"}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                   <div className="h-7 w-7 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold">
                      {review.user_name.charAt(0).toUpperCase()}
                   </div>
                   <span className="text-sm font-bold">{review.user_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">{review.rating}</span>
                  <Star className="h-3 w-3 fill-gold text-gold" />
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                   <MessageSquare className="h-3 w-3 shrink-0" />
                   <span className="truncate">{review.comment}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                      disabled={deleting === review.id}
                    >
                      {deleting === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-border/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This review will be permanently removed from the public product page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteReview(review.id)}
                        className="bg-red-500 hover:bg-red-600 rounded-xl"
                      >
                        Delete Review
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReviewList;
