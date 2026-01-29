import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { blogService, Blog } from "@/lib/services/blogService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ArrowLeft, Calendar, User } from "lucide-react";
// import ReactMarkdown from 'react-markdown'; // Assuming user might want rich text later, but simple text for now

const BlogDetail = () => {
  const { id } = useParams(); // Keep parameter name as 'id' from router, but treat as potential slug
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBlog(id);
  }, [id]);

  const fetchBlog = async (slug: string) => {
    try {
      const data = await blogService.getBlogBySlug(slug);
      console.log("Blog Content:", data?.content); 
      setBlog(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center">Blog not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
           <div className="absolute inset-0 bg-black/40 z-10" />
           {blog.media_type === 'video' ? (
              <video src={blog.cover_image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
           ) : (
              <img src={blog.cover_image} className="w-full h-full object-cover" alt={blog.title} />
           )}
           <div className="absolute inset-0 z-20 flex flex-col justify-end container mx-auto px-6 pb-20">
              <Link to="/blog" className="text-white/80 hover:text-white flex items-center gap-2 mb-6 uppercase tracking-widest text-xs font-bold transition-colors">
                 <ArrowLeft className="h-4 w-4" /> Back to Journal
              </Link>
              <h1 className="text-4xl md:text-6xl font-heading text-white mb-6 leading-tight max-w-4xl">{blog.title}</h1>
              <div className="flex items-center gap-6 text-white/90 text-sm font-medium">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(blog.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-2"><User className="h-4 w-4" /> {blog.author_name}</span>
              </div>
           </div>
        </div>

        {/* Content */}
        <article className="container mx-auto px-6 py-20 max-w-3xl">
           <div className="prose prose-lg prose-headings:font-heading prose-a:text-gold hover:prose-a:text-gold/80 prose-invert">
              {/* Simple whitespace handling for now. Can upgrade to Markdown renderer. */}
               {/* Rich Text Rendering */}
               <div 
                  className="text-muted-foreground leading-relaxed [&>img]:rounded-xl [&>img]:my-8 [&>p]:mb-6 [&_a]:!text-[#f97316] [&_a]:!underline [&_a]:font-medium"
                  dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} 
               />
           </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
