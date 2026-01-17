import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogService, Blog } from "@/lib/services/blogService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Calendar, User, ArrowRight, PlayCircle } from "lucide-react";

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await blogService.getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
           <h1 className="text-4xl md:text-5xl font-heading animate-fade-in">The Fragrance Journal</h1>
           <p className="text-muted-foreground text-lg animate-slide-up">Discover stories, tips, and the art behind our scents.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold h-8 w-8" /></div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl">
            <p className="text-muted-foreground">No stories yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, idx) => (
              <Link 
                to={`/blog/${blog.id}`} 
                key={blog.id} 
                className="group flex flex-col gap-4 animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted relative">
                   {blog.media_type === 'video' ? (
                      <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700">
                        <video src={blog.cover_image} className="w-full h-full object-cover" muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                           <PlayCircle className="h-12 w-12 text-white opacity-80" />
                        </div>
                      </div>
                   ) : (
                      <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   )}
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-wider font-bold">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(blog.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {blog.author_name}</span>
                   </div>
                   <h3 className="text-xl font-heading group-hover:text-gold transition-colors line-clamp-2">{blog.title}</h3>
                   <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{blog.excerpt || blog.content.substring(0, 150)}...</p>
                   <span className="text-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-2 group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight className="h-3 w-3" />
                   </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogList;
