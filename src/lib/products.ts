import legendImg from "@/assets/legend.jpg";
import teddyGirlImg from "@/assets/teddy-girl.jpg";
import toxiqImg from "@/assets/toxiq.jpg";
import chaseMeImg from "@/assets/chase-me.jpg";
import chillVibeImg from "@/assets/chill-vibe.jpg";

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
  olfactoryNotes?: OlfactoryNote[];
  isHidden?: boolean;
}

// This list is only used for INITIAL SEEDING to the database.
// After seeding, the app will use Supabase exclusively.
export const products: Product[] = [
  {
    id: "legend",
    name: "Legend",
    category: "Men",
    price: 1299,
    size: "50ml",
    notes: ["Bergamot", "Lemon"],
    description: "A bold, masculine fragrance that captures the essence of timeless elegance. Fresh citrus notes blend with warm undertones for the modern gentleman.",
    images: [legendImg],
  },
  {
    id: "teddy-girl",
    name: "Teddy Girl",
    category: "Women",
    price: 1299,
    size: "50ml",
    notes: ["Apple Blossom", "Rose"],
    description: "A delicate floral symphony that celebrates femininity. Soft rose petals dance with fresh apple blossom in this enchanting eau de parfum.",
    images: [teddyGirlImg],
  },
  {
    id: "toxiq",
    name: "Toxiq",
    category: "Unisex",
    price: 1299,
    size: "50ml",
    notes: ["Wild Plum", "Jasmine"],
    description: "An intoxicating blend of mysterious fruits and exotic florals. Daring, seductive, and utterly unforgettable.",
    images: [toxiqImg],
  },
  {
    id: "chase-me",
    name: "Chase Me",
    category: "Unisex",
    price: 1299,
    size: "50ml",
    notes: ["Cacao", "Vanilla"],
    description: "A warm, gourmand fragrance that wraps you in luxury. Rich cacao meets creamy vanilla for an irresistible finish.",
    images: [chaseMeImg],
  },
  {
    id: "chill-vibe",
    name: "Chill Vibe",
    category: "Unisex",
    price: 1299,
    size: "50ml",
    notes: ["Mojito", "Lime"],
    description: "A refreshing escape captured in a bottle. Zesty lime and cool mint create a carefree, invigorating experience.",
    images: [chillVibeImg],
  },
];

export const giftSet: Product = {
  id: "gift-set",
  name: "Essence of Every Mood",
  category: "Unisex",
  price: 2499,
  size: "Gift Set",
  notes: ["All Five Fragrances"],
  description: "The complete Puniora collection. Five signature scents for every mood, beautifully presented in our luxury gift box.",
  images: [legendImg],
  isGiftSet: true,
};

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString("en-IN")}`;
};
