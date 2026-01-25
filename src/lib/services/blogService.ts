import { supabase } from "@/lib/supabase";

export interface Blog {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  cover_image: string;
  media_type: 'image' | 'video';
  author_name: string;
  created_at: string;
  updated_at: string;
}

export const blogService = {
  async getBlogs() {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
    return data || [];
  },

  async getBlogById(id: string) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
    return data;
  },

  async createBlog(blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('blogs')
      .insert(blog)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBlog(id: string, updates: Partial<Blog>) {
    const { data, error } = await supabase
      .from('blogs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBlog(id: string) {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
  },

  async getBlogBySlug(slug: string): Promise<Blog | null> {
      // 1. Check if it's a UUID (backward compatibility)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(slug)) {
          return this.getBlogById(slug);
      }

      // 2. Search by title (best effort since we don't store slugs)
      // Standardize search
      const { data } = await supabase.from('blogs').select('*');
      
      if (data) {
          const found = data.find(b => this.createSlug(b.title) === slug);
          if (found) return found;
      }

      return null;
  }
};
