export interface ProductVariant {
  size: string;
  price: number;
  image?: string;
  description?: string;
}

export interface OlfactoryNote {
  name: string;
  image: string;
  description: string;
}

export interface ProductSection {
  id?: string; // Optional for new ones before save
  title: string;
  content: string;
}

export interface Product {
  id: string;
  name: string;
  category: "Men" | "Women" | "Unisex";
  price: number;
  real_price?: number; // MRP for strikethrough
  size: string;
  notes: string[];
  description: string;
  images: string[];
  variants?: ProductVariant[];
  isGiftSet?: boolean;
  videos?: string[];
  gallery?: string[]; // Separate gallery images
  selectedNote?: string;
  bundleItems?: string[]; // Array of Product IDs that make up this bundle
  extraSections?: ProductSection[];
  created_at?: string; // Timestamp for creation

  olfactoryNotes?: OlfactoryNote[];
  isHidden?: boolean;
  is_featured?: boolean;
  is_sold_out?: boolean;
}

// This list is only used for INITIAL SEEDING to the database.
// After seeding, the app will use Supabase exclusively.
export const products: Product[] = [];

export const giftSet: Product = {
  id: "gift-set",
  name: "Essence of Every Mood",
  category: "Unisex",
  price: 2499,
  size: "Gift Set",
  notes: ["All Five Fragrances"],
  description: "The complete Puniora collection. Five signature scents for every mood, beautifully presented in our luxury gift box.",
  images: [], // No default images
  isGiftSet: true,
};

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};
