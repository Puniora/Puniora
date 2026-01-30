import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  phone: string;
  is_default: boolean;
}

export const userService = {
  // Profile Methods
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Address Methods
  async getAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addAddress(address: Omit<Address, "id" | "user_id"> & { user_id: string }) {
    // If setting as default, unset others first
    if (address.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert(address)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAddress(id: string, updates: Partial<Address>) {
    // If setting as default, unset others first (need user_id for this logic)
    // For simplicity, we assume the frontend handles the refresh or we do a bulk update.
    // Let's do a safe check if 'is_default' is true.
    if (updates.is_default) {
       // We need to know the user_id. Fetch it first or pass it.
       // A bit inefficient but safer:
       const { data: current } = await supabase.from('addresses').select('user_id').eq('id', id).single();
       if (current) {
          await supabase.from("addresses").update({ is_default: false }).eq("user_id", current.user_id);
       }
    }

    const { data, error } = await supabase
      .from("addresses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAddress(id: string) {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};
