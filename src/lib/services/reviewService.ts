import { supabase } from "../supabase";

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  images: string[];
  created_at: string;
}

const TABLE_NAME = "reviews";

export const reviewService = {
  async getReviews(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching reviews for ${productId}:`, error);
      throw error;
    }

    return data as Review[];
  },

  async getAllReviews(): Promise<(Review & { product_name?: string })[]> {
    try {
      // Try fetching with product name join first
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          products (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(review => ({
        ...review,
        product_name: review.products?.name
      }));
    } catch (joinError) {
      console.warn("Join fetch failed, falling back to simple fetch:", joinError);
      
      // Fallback: Fetch reviews only if join fails (e.g., relationship issues)
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all reviews (fallback):", error);
        throw error;
      }

      return (data || []).map(review => ({
        ...review,
        product_name: "Unknown Product" 
      }));
    }
  },

  async addReview(review: Omit<Review, "id" | "created_at"> & { created_at?: string }): Promise<Review> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([review])
      .select()
      .single();

    if (error) {
      console.error("Error adding review:", error);
      throw error;
    }

    return data as Review;
  },

  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },

  async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("rating")
      .eq("product_id", productId);

    if (error) {
      console.error(`Error fetching average rating for ${productId}:`, error);
      return { average: 0, count: 0 };
    }

    if (!data || data.length === 0) return { average: 0, count: 0 };

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      average: Number((sum / data.length).toFixed(1)),
      count: data.length,
    };
  },

  async seedInitialReviews(): Promise<{ success: boolean; message: string }> {
     // Check if reviews already exist
    const { count, error: countError } = await supabase
      .from(TABLE_NAME)
      .select("*", { count: 'exact', head: true });
    
    if (countError) {
       console.error("Error checking existing reviews:", countError);
       return { success: false, message: "Failed to check reviews table: " + countError.message };
    }

    if (count && count > 0) {
       return { success: true, message: "Reviews already populated." };
    }

    // Fetch products to link reviews to real IDs
    const { data: products } = await supabase.from('products').select('id, name');
    
    if (!products || products.length === 0) {
       return { success: false, message: "No products found. Cannot seed reviews." };
    }
    
    // Create dummy reviews linked to the first few products
    const dummyReviews = [
      {
        product_id: products[0]?.id,
        user_name: 'Amit Patel',
        rating: 5,
        comment: 'Absolutely love this scent! Lasts all day and feels very premium.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
      },
      {
        product_id: products[0]?.id,
        user_name: 'Sarah James',
        rating: 4,
        comment: 'Great packaging and fast delivery. The fragrance is nice but a bit strong for me.',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
      },
      {
         product_id: products[1] ? products[1].id : products[0].id,
         user_name: 'Rahul Verma',
         rating: 5,
         comment: 'Best perfume I have bought online. Highly recommended!',
         created_at: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
      }
    ];

    const { error: insertError } = await supabase.from(TABLE_NAME).insert(dummyReviews);
    
    if (insertError) {
      console.error("Error seeding reviews:", insertError);
      return { success: false, message: "Failed to seed reviews: " + insertError.message };
    }

    return { success: true, message: "Reviews seeded successfully!" };
  }
};
