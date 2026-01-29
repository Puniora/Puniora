import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus, Image as ImageIcon, Video, Bold, Italic, Underline, Strikethrough, Link as LinkIcon } from "lucide-react";
import { blogService, Blog } from "@/lib/services/blogService";
import { toast } from "sonner";
import { getDirectUrl } from "@/lib/utils/imageUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogManager = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
    
    // Form State
    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);

    // Image Dialog State
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [savedRange, setSavedRange] = useState<any>(null);
    const quillRef = useRef<any>(null);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],

                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: () => {
                    const editor = quillRef.current?.getEditor();
                    if (editor) {
                        const range = editor.getSelection();
                        setSavedRange(range);
                    }
                    setShowImageDialog(true);
                }
            }
        }
    }), []);

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

    const handleSave = async () => {
        if (!newBlog.title) {
            toast.error("Please enter a title");
            return;
        }
        setIsCreating(true);
        try {
            // Ensure cover image is processed
            const processedBlog = {
                ...newBlog,
                cover_image: getDirectUrl(newBlog.cover_image)
            };

            if (editingId) {
                await blogService.updateBlog(editingId, processedBlog);
                toast.success("Blog updated successfully!");
            } else {
                await blogService.createBlog(processedBlog);
                toast.success("Blog published successfully!");
            }

            resetForm();
            fetchBlogs();
            setViewMode('list');
        } catch (error) {
            console.error(error);
            toast.error(editingId ? "Failed to update blog" : "Failed to publish blog");
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setNewBlog({
            title: "",
            content: "",
            excerpt: "",
            cover_image: "",
            media_type: "image",
            author_name: "Puniora Team"
        });
        setEditingId(null);
    };

    const handleEdit = (blog: Blog) => {
        setNewBlog({
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt || "",
            cover_image: blog.cover_image,
            media_type: blog.media_type,
            author_name: blog.author_name
        });
        setEditingId(blog.id);
        setViewMode('edit');
    };



    const handleImageSubmit = () => {
        if (!imageUrlInput) {
            setShowImageDialog(false);
            return;
        }

        const editor = quillRef.current?.getEditor();
        if (editor) {
            // Use saved range or current selection (or end of doc)
            const range = savedRange || editor.getSelection() || { index: editor.getLength(), length: 0 };
            editor.insertEmbed(range.index, 'image', imageUrlInput);
            // Move cursor after image
            editor.setSelection(range.index + 1);
        }
        
        setShowImageDialog(false);
        setImageUrlInput("");
        setSavedRange(null);
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

    if (viewMode === 'list') {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-heading font-bold text-white">Posts</h2>
                        <p className="text-muted-foreground">Manage your blog posts and articles.</p>
                    </div>
                    <Button onClick={() => { resetForm(); setViewMode('edit'); }} className="bg-gold text-white hover:bg-gold/90">
                        <Plus className="mr-2 h-4 w-4" /> New Post
                    </Button>
                </div>

                <div className="grid gap-4">
                     {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold" /></div>
                    ) : blogs.length === 0 ? (
                        <Card className="bg-muted/10 border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <p>No published posts yet.</p>
                                <Button variant="link" onClick={() => { resetForm(); setViewMode('edit'); }} className="text-gold">Create your first post</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        blogs.map(blog => (
                            <div key={blog.id} className="flex gap-4 p-4 border border-white/10 rounded-xl bg-card hover:bg-muted/10 transition-colors group relative items-center">
                                <div className="h-16 w-16 shrink-0 bg-muted rounded-lg overflow-hidden border border-white/5">
                                    {blog.media_type === 'video' ? (
                                        <video src={blog.cover_image} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={getDirectUrl(blog.cover_image)} alt={blog.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pointer-events-none md:pointer-events-auto cursor-pointer" onClick={() => handleEdit(blog)}>
                                    <h4 className="font-bold text-lg truncate pr-8 text-white">{blog.title}</h4>
                                    <div className="flex gap-3 text-xs text-muted-foreground mt-1 items-center">
                                        <span className="bg-gold/10 text-gold px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Published</span>
                                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{blog.author_name}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-white hover:bg-white/10"
                                        onClick={() => handleEdit(blog)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(blog.id); }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // EDITOR VIEW
    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
             {/* Toolbar / Header */}
             <div className="flex justify-between items-center bg-card border border-white/10 p-4 rounded-xl">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => { resetForm(); setViewMode('list'); }}>
                        ← Back
                    </Button>
                    <div className="h-6 w-px bg-white/10"></div>
                    <span className="font-medium text-muted-foreground">{editingId ? 'Edit Post' : 'New Post'}</span>
                 </div>
                 <div className="flex gap-2">
                     <Button variant="outline" onClick={() => { resetForm(); setViewMode('list'); }}>Discard</Button>
                     <Button onClick={handleSave} disabled={isCreating} className="bg-gold text-white hover:bg-gold/90 min-w-[120px]">
                        {isCreating ? <Loader2 className="animate-spin h-4 w-4" /> : (editingId ? "Update" : "Publish")}
                     </Button>
                 </div>
             </div>

             <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden">
                {/* Main Content Area */}
                <div className="w-full md:flex-1 bg-card rounded-xl border border-white/10 p-4 md:p-8 flex flex-col gap-6 md:overflow-y-auto shadow-sm min-h-[500px]">
                    <input
                        type="text"
                        placeholder="Post Title"
                        className="text-3xl md:text-4xl font-heading font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-white"
                        value={newBlog.title}
                        onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
                        autoFocus
                    />
                    <div className="h-px w-full bg-white/10"></div>
                    
                    <div className="text-white flex-1 flex flex-col">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={newBlog.content}
                            onChange={(content) => setNewBlog({ ...newBlog, content })}
                            modules={modules}
                            className="bg-transparent text-white flex-1 flex flex-col"
                            placeholder="Start writing your story..."
                        />
                        <style>{`
                            .ql-toolbar.ql-snow { border-color: rgba(255,255,255,0.1); border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
                            .ql-container.ql-snow { border-color: rgba(255,255,255,0.1); border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem; font-size: 1.125rem; flex: 1; display: flex; flex-direction: column; }
                            .ql-editor { flex: 1; min-height: 300px; font-family: serif; }
                            .ql-editor a { color: #f97316 !important; text-decoration: underline !important; }
                            .ql-snow .ql-stroke { stroke: #a1a1aa; }
                            .ql-snow .ql-fill { fill: #a1a1aa; }
                            .ql-snow .ql-picker { color: #a1a1aa; }
                        `}</style>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="w-full md:w-80 shrink-0 flex flex-col gap-4 md:overflow-y-auto pb-4">
                    
                    {/* Featured Image */}
                    <div className="bg-card rounded-xl border border-white/10 overflow-hidden">
                        <div className="bg-muted/20 px-4 py-3 border-b border-white/10 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                            Featured Media
                        </div>
                        <div className="p-4 space-y-4">
                            <Select value={newBlog.media_type} onValueChange={(v: 'image' | 'video') => setNewBlog({ ...newBlog, media_type: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="image"><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image</div></SelectItem>
                                    <SelectItem value="video"><div className="flex items-center gap-2"><Video className="h-4 w-4" /> Video</div></SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                value={newBlog.cover_image}
                                onChange={e => setNewBlog({ ...newBlog, cover_image: e.target.value })}
                                placeholder="Media URL (Drive/ImgBB)"
                                className="text-xs"
                            />

                            <div className="aspect-video bg-muted/20 rounded-lg border border-white/5 overflow-hidden flex items-center justify-center">
                                {newBlog.cover_image ? (
                                    newBlog.media_type === 'video' ? (
                                        <video src={newBlog.cover_image} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={getDirectUrl(newBlog.cover_image)} className="w-full h-full object-cover" alt="Preview" />
                                    )
                                ) : (
                                    <ImageIcon className="text-muted-foreground opacity-20 h-8 w-8" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search & Meta */}
                    <div className="bg-card rounded-xl border border-white/10 overflow-hidden">
                        <div className="bg-muted/20 px-4 py-3 border-b border-white/10 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                            Search Settings
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Excerpt / Description</Label>
                                <Textarea
                                    value={newBlog.excerpt}
                                    onChange={e => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                                    placeholder="Brief summary for search engines..."
                                    className="h-32 text-sm bg-muted/10 resize-none"
                                />
                            </div>
                                <div className="space-y-2">
                                <Label className="text-xs">Author</Label>
                                <Input
                                    value={newBlog.author_name}
                                    onChange={e => setNewBlog({ ...newBlog, author_name: e.target.value })}
                                    className="text-sm bg-muted/10"
                                />
                            </div>
                        </div>
                    </div>

                </div>
             </div>

            {/* Image Insertion Dialog */}
            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                        <DialogDescription>
                            Enter the direct URL of the image you want to insert.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="image-url" className="text-right mb-2 block">
                            Image URL
                        </Label>
                        <Input
                            id="image-url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleImageSubmit();
                                }
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
                        <Button onClick={handleImageSubmit} className="bg-gold text-white hover:bg-gold/90">Insert Image</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BlogManager;
