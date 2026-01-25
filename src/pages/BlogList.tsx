import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogService, Blog } from "@/lib/services/blogService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Loader2, Calendar, User, ArrowRight, PlayCircle, Share2 } from "lucide-react";

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>?/gm, '');
};

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
      <main className="flex-1 container mx-auto px-6 pt-24 md:pt-32 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16 space-y-4">
           <h1 className="text-3xl md:text-5xl font-heading animate-fade-in">The Fragrance Journal</h1>
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
              <div 
                key={blog.id} 
                className="group flex flex-row md:flex-col gap-4 animate-slide-up relative items-start"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-[120px] sm:w-[160px] md:w-full shrink-0 aspect-square md:aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden bg-muted relative">
                   <Link to={`/blog/${blogService.createSlug(blog.title)}`} className="block w-full h-full">
                     {blog.media_type === 'video' ? (
                        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700">
                          <video src={blog.cover_image} className="w-full h-full object-cover" muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                             <PlayCircle className="h-8 w-8 md:h-12 md:w-12 text-white opacity-80" />
                          </div>
                        </div>
                     ) : (
                        <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     )}
                   </Link>
                   
                   {/* Share Button Overlay */}
                   <button
                      onClick={(e) => {
                          e.preventDefault();
                          const url = `${window.location.origin}/blog/${blogService.createSlug(blog.title)}`;
                          const text = `Check out "${blog.title}"\n${blog.excerpt || stripHtml(blog.content).substring(0, 100) + '...'}`;
                          
                          if (navigator.share) {
                              navigator.share({ 
                                  title: blog.title, 
                                  text: text,
                                  url 
                              }).catch(console.error);
                          } else {
                              navigator.clipboard.writeText(`${text}\n\n${url}`);
                              toast.success("Link and details copied to clipboard!");
                          }
                      }}
                      className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-gold hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 duration-300 z-10"
                      title="Share"
                   >
                      <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                   </button>
                </div>
                
                <Link to={`/blog/${blogService.createSlug(blog.title)}`} className="space-y-2 block flex-1 min-w-0">
                   <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-wider font-bold">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(blog.created_at).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-lg md:text-xl font-heading group-hover:text-gold transition-colors line-clamp-2 leading-tight">{blog.title}</h3>
                   <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed text-xs md:text-sm">
                      {blog.excerpt || stripHtml(blog.content).substring(0, 150) + (stripHtml(blog.content).length > 150 ? '...' : '')}
                   </p>
                   <span className="text-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-2 group-hover:translate-x-1 transition-transform">
                      Read <span className="hidden md:inline">Story</span> <ArrowRight className="h-3 w-3" />
                   </span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogList;
