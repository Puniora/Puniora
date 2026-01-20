import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus, Image as ImageIcon, Video } from "lucide-react";
import { blogService, Blog } from "@/lib/services/blogService";
import { toast } from "sonner";
import { getDirectUrl } from "@/lib/utils/imageUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const BlogManager = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newBlog, setNewBlog] = useState<{
        title: string;
        content: string;
        excerpt: string;
        cover_image: string;
        media_type: 'image' | 'video';
        author_name: string;
    }>({
        title: "",
        content: "",
        excerpt: "",
        cover_image: "",
        media_type: "image",
        author_name: "Puniora Team"
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const data = await blogService.getBlogs();
            setBlogs(data);
        } catch (error) {
            toast.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            // Ensure cover image is processed
            const processedBlog = {
                ...newBlog,
                cover_image: getDirectUrl(newBlog.cover_image)
            };

            await blogService.createBlog(processedBlog);
            toast.success("Blog published successfully!");
            setNewBlog({
                title: "",
                content: "",
                excerpt: "",
                cover_image: "",
                media_type: "image",
                author_name: "Puniora Team"
            });
            fetchBlogs();
        } catch (error) {
            console.error(error);
            toast.error("Failed to publish blog");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            await blogService.deleteBlog(id);
            setBlogs(prev => prev.filter(b => b.id !== id));
            toast.success("Blog deleted");
        } catch (error) {
            toast.error("Failed to delete blog");
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Create Blog Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Write a New Story</CardTitle>
                    <CardDescription>Share news, tips, or stories with your customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                required
                                value={newBlog.title}
                                onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
                                placeholder="Enter blog title"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Media Type</Label>
                                <Select value={newBlog.media_type} onValueChange={(v: 'image' | 'video') => setNewBlog({ ...newBlog, media_type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="image"><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image</div></SelectItem>
                                        <SelectItem value="video"><div className="flex items-center gap-2"><Video className="h-4 w-4" /> Video</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Author Name</Label>
                                <Input
                                    value={newBlog.author_name}
                                    onChange={e => setNewBlog({ ...newBlog, author_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Cover Media URL {newBlog.media_type === 'video' ? '(Video Link)' : '(Image Link)'}</Label>
                            <Input
                                required
                                value={newBlog.cover_image}
                                onChange={e => setNewBlog({ ...newBlog, cover_image: e.target.value })}
                                placeholder="Paste link (ImgBB, etc)..."
                            />
                            {newBlog.cover_image && (
                                <div className="mt-2 rounded-lg overflow-hidden h-40 bg-muted/20 border">
                                    {newBlog.media_type === 'video' ? (
                                        <video src={newBlog.cover_image} className="w-full h-full object-cover" controls />
                                    ) : (
                                        <img src={getDirectUrl(newBlog.cover_image)} className="w-full h-full object-cover" alt="Preview" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Excerpt (Short Summary)</Label>
                            <Textarea
                                value={newBlog.excerpt}
                                onChange={e => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                                placeholder="A brief preview of the post..."
                                className="h-20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Full Content</Label>
                            <Textarea
                                required
                                value={newBlog.content}
                                onChange={e => setNewBlog({ ...newBlog, content: e.target.value })}
                                placeholder="Write your story here..."
                                className="h-60 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground text-right">Supports basic text. Use double enter for new paragraphs.</p>
                        </div>

                        <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-white" disabled={isCreating}>
                            {isCreating ? <Loader2 className="animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Publish Blog</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Existing Blogs List */}
            <Card>
                <CardHeader>
                    <CardTitle>Published Stories</CardTitle>
                    <CardDescription>Manage your existing blog posts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gold" /></div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground italic">No blogs published yet.</div>
                    ) : (
                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                            {blogs.map(blog => (
                                <div key={blog.id} className="flex gap-4 p-4 border rounded-xl hover:bg-muted/10 transition-colors group relative">
                                    <div className="h-20 w-20 shrink-0 bg-muted rounded-lg overflow-hidden">
                                        {blog.media_type === 'video' ? (
                                            <video src={blog.cover_image} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={getDirectUrl(blog.cover_image)} alt={blog.title} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold truncate pr-8">{blog.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{blog.excerpt || blog.content}</p>
                                        <div className="flex gap-2 mt-2 text-[10px] uppercase font-bold text-muted-foreground">
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{blog.author_name}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(blog.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogManager;
