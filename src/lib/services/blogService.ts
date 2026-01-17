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
  }
};
