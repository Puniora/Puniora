import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/products";

// Table name: products
const TABLE_NAME = "products";

const mapToProduct = (data: any): Product => ({
  ...data,
  isGiftSet: data.is_gift_set,
  variants: data.variants || [],
  bundleItems: data.bundle_items || [],
  gallery: data.gallery || [],
  isHidden: data.isHidden || false,
  real_price: data.real_price,
  is_sold_out: data.is_sold_out || false,
});

const mapToDb = (product: any) => {
  const db: any = { ...product };
  if (db.isGiftSet !== undefined) {
    db.is_gift_set = db.isGiftSet;
    delete db.isGiftSet;
  }
  if (db.bundleItems !== undefined) {
    db.bundle_items = db.bundleItems;
    delete db.bundleItems;
  }
  if (db.real_price !== undefined) {
    db.real_price = db.real_price; // Assuming column name is same
  }
  if (db.gallery !== undefined) {
    // Ensure it's an array
    if (!Array.isArray(db.gallery)) {
      db.gallery = [];
    }
  }
  // Ensure variants is valid JSON or array
  if (!db.variants) {
    db.variants = [];
  }
  // Map isHidden to DB column (assuming camelCase 'isHidden' or snake_case 'is_hidden')
  // Since we used quotes in SQL "isHidden", it matches exact camelCase.
  // But supbase client might lower case it? Let's assume matches property name if we pass it.
  // If property is `isHidden`, it's already there. 
  // If we wanted safe mapping:
  // if (db.isHidden !== undefined) { db["isHidden"] = db.isHidden; }
  
  return db;
};

const compressImage = async (file: File): Promise<File> => {
  // Skip compression for small files (e.g. < 500KB) or non-images
  if (file.size < 512 * 1024 || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file); // Fallback to original
            return;
          }
          // Create new file with WebP extension
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const compressedFile = new File([blob], newFileName, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/webp', 0.8); // 80% quality
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const productService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return (data || []).map(mapToProduct);
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }

    return mapToProduct(data);
  },

  async addProduct(product: Omit<Product, "id">): Promise<Product> {
    const dbProduct = mapToDb(product);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(dbProduct)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Failed to insert product");

    return mapToProduct(data[0]);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const dbUpdates = mapToDb(updates);
    
    // Debug: Check auth state before update
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`[UpdateDebug] User: ${user?.id || 'ANONYMOUS'}, Updating Product: ${id}`, dbUpdates);

    // Remove ID from updates if present to avoid PK update issues (though usually harmless if same)
    delete dbUpdates.id;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(dbUpdates)
      .eq("id", id)
      .select();

    if (error) {
        console.error("[UpdateDebug] PostgREST Error:", error);
        throw error;
    }
    
    if (!data || data.length === 0) {
        console.error("[UpdateDebug] Update returned 0 rows. Likely RLS blocking it or ID not found.");
        throw new Error("Product not found or update failed (Check Permissions)");
    }

    return mapToProduct(data[0]);
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  async uploadImage(file: File): Promise<string> {
    // Compress image before uploading (with fallback)
    let fileToUpload = file;
    try {
      const compressed = await compressImage(file);
      fileToUpload = compressed;
    } catch (err) {
      console.warn("Image compression failed, using original file:", err);
      // Fallback to original file is automatic since fileToUpload = file initially
    }

    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, fileToUpload);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Mock seed data for initial setup if table is empty
  async seedInitialProducts(initialProducts: Product[]): Promise<{ success: boolean; message: string }> {
    const { data: existing, error: fetchError } = await supabase.from(TABLE_NAME).select("id").limit(1);

    if (fetchError) {
      console.error("Error checking existing products:", fetchError);
      return { success: false, message: "Failed to check database: " + fetchError.message };
    }

    if (existing && existing.length === 0) {
      console.log("Seeding products...");
      const dbProducts = initialProducts.map(p => {
        const { id, ...rest } = mapToDb(p);
        return rest;
      });

      const { error } = await supabase.from(TABLE_NAME).insert(dbProducts);
      if (error) {
        console.error("Error seeding products:", error);
        return { success: false, message: "Seeding failed: " + error.message };
      }
      return { success: true, message: "Database seeded successfully!" };
    } else {
      console.log("Database already has products, skipping seed.");
      return { success: true, message: "Database already populated. Skipping seed." };
    }
  },

  createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    // 1. Try to find by exact name matching the slugified version
    // Since we don't store a slug column, we have to search. 
    // Best effort: Search by name ILIKE with wildcards or exact match if we can reverse it somewhat.
    // Actually, simple approach: Fetch all products and find matching slug (inefficient but safe for small catalog),
    // OR use ILIKE on name.
    
    // Let's try to fetch by ID first if it looks like a UUID (backward compatibility)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(slug)) {
       return this.getProductById(slug);
    }

    // Name based search.
    // We can try to reverse match: replace - with % to search. 
    // e.g. "black-oud" -> "black%oud".
    
    // Search strategy:
    // 1. Try strict match assuming name was just lowercased and spaces replaced by dashes.
    const namePart = slug.replace(/-/g, ' ');
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .ilike('name', namePart)
      .limit(1); // Get the first one if multiple
      
    if (!error && data && data.length > 0) {
        return mapToProduct(data[0]);
    }
    
    // If strict match fails, try broader search (e.g. if slug has extra ID chars)
    // Or just fetch all and filter in JS (good fallback for < 1000 items)
    const { data: allData } = await supabase.from(TABLE_NAME).select("*");
    if (allData) {
        const found = allData.find(p => this.createSlug(p.name) === slug || slug.startsWith(this.createSlug(p.name)));
        if (found) return mapToProduct(found);
    }

    return null;
  }
};

