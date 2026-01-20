import { useState, useEffect } from "react";
import { Product } from "@/lib/products";
import { productService } from "@/lib/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Plus, Trash2, ArrowRight, Loader2, Sparkles, Save, Edit, X, ImagePlus, Eye, EyeOff, Minus } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ProductSection, OlfactoryNote } from "@/lib/products";
import AdminReviewManager from "./AdminReviewManager";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getDirectUrl } from "@/lib/utils/imageUtils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface GiftSetBuilderProps {
    products: Product[];
    onRefresh: () => void;
}

const GiftSetBuilder = ({ products, onRefresh }: GiftSetBuilderProps) => {
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [bundleName, setBundleName] = useState("My New Gift Set");
    const [offerPrice, setOfferPrice] = useState<string>("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    // New State Fields
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isHidden, setIsHidden] = useState(false);
    const [extraSections, setExtraSections] = useState<ProductSection[]>([]);
    const [olfactoryNotes, setOlfactoryNotes] = useState<OlfactoryNote[]>([]);

    // For manual images input if needed (consistent with ProductForm)
    const [imageUrlInput, setImageUrlInput] = useState("");

    const existingGiftSets = products.filter(p => p.isGiftSet);

    useEffect(() => {
        // Filter out existing gift sets to prevent bundling a bundle
        setAvailableProducts(products.filter(p => !p.isGiftSet));
    }, [products]);

    const getDirectUrl = (url: string) => {
        if (!url) return url;

        // Handle Google Drive links
        if (url.includes('drive.google.com')) {
            // Extract file ID
            // Supports formats:
            // 1. https://drive.google.com/file/d/FILE_ID/view
            // 2. https://drive.google.com/open?id=FILE_ID
            let fileId = '';
            const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);

            if (match1) fileId = match1[1];
            else if (match2) fileId = match2[1];

            if (fileId) {
                return `https://drive.google.com/uc?export=view&id=${fileId}`;
            }
        }

        return url;
    };

    const toggleItem = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(prev => prev.filter(item => item !== id));
        } else {
            setSelectedItems(prev => [...prev, id]);
        }
    };

    const selectedProducts = availableProducts.filter(p => selectedItems.includes(p.id));
    const totalValue = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    const bundleSaving = Math.max(0, totalValue - (Number(offerPrice) || 0));

    const handlePublish = async () => {
        if (selectedItems.length < 2) {
            toast.error("Please select at least 2 items mainly.");
            return;
        }
        if (!offerPrice || Number(offerPrice) <= 0) {
            toast.error("Please set a valid offer price.");
            return;
        }
        if (!bundleName) {
            toast.error("Please name your bundle.");
            return;
        }

        try {
            setLoading(true);

            // Create proper gift set payload
            const payload: Partial<Product> = {
                id: editingId || undefined, // Include ID if editing
                name: bundleName,
                price: Number(offerPrice),
                description: description || `A curated collection containing: ${selectedProducts.map(p => p.name).join(", ")}.`,
                category: "Unisex",
                size: "Gift Set",
                isGiftSet: true,
                notes: ["Gift Bundle", ...selectedProducts.map(p => p.name)],
                images: imageUrl ? [imageUrl] : [],
                bundleItems: selectedItems,
                variants: [],
                isHidden: isHidden,
                extraSections: extraSections,
                olfactoryNotes: olfactoryNotes
            };

            if (editingId) {
                await productService.updateProduct(editingId, payload);
                toast.success("Gift Set Updated Successfully!");
            } else {
                await productService.addProduct(payload as any);
                toast.success("Gift Set Published Successfully!");
            }

            // Reset form
            resetForm();
            onRefresh();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to save gift set: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setSelectedItems([]);
        setBundleName("My New Gift Set");
        setOfferPrice("");
        setDescription("");
        setImageUrl("");
        setIsHidden(false);
        setExtraSections([]);
        setOlfactoryNotes([]);
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setBundleName(product.name);
        setOfferPrice(product.price.toString());
        setDescription(product.description);
        setImageUrl(product.images[0] || "");
        setSelectedItems(product.bundleItems || []);
        setIsHidden(product.isHidden || false);
        setExtraSections(product.extraSections || []);
        setOlfactoryNotes(product.olfactoryNotes || []);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this Gift Set?")) {
            try {
                await productService.deleteProduct(id);
                toast.success("Gift Set deleted.");
                if (editingId === id) resetForm();
                onRefresh();
            } catch (e) {
                toast.error("Failed to delete.");
            }
        }
    };

    // Helper functions for Extra Sections
    const addSection = () => setExtraSections(prev => [...prev, { title: "", content: "" }]);
    const removeSection = (index: number) => setExtraSections(prev => prev.filter((_, i) => i !== index));
    const updateSection = (index: number, field: keyof ProductSection, value: string) =>
        setExtraSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));

    // Helper functions for Olfactory Notes
    const addOlfactoryNote = () => setOlfactoryNotes(prev => [...prev, { name: "", image: "", description: "" }]);
    const removeOlfactoryNote = (index: number) => setOlfactoryNotes(prev => prev.filter((_, i) => i !== index));
    const updateOlfactoryNote = (index: number, field: keyof OlfactoryNote, value: string) =>
        setOlfactoryNotes(prev => prev.map((n, i) => i === index ? { ...n, [field]: value } : n));


    return (
        <div className="space-y-8 animate-fade-in">

            {/* Builder Section - Only show if no gift set exists OR we are editing one */}
            {(existingGiftSets.length === 0 || editingId) ? (
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left: Product Selection */}
                    <Card className="lg:col-span-1 border-border shadow-md">
                        <CardHeader className="bg-muted/10 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="w-5 h-5 text-gold" /> Select Items
                            </CardTitle>
                            <CardDescription>
                                Choose perfumes to include in this bundle.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                            <div className="divide-y divide-border">
                                {availableProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className={`flex items-center p-4 hover:bg-muted/20 cursor-pointer transition-colors ${selectedItems.includes(product.id) ? 'bg-gold/5' : ''}`}
                                        onClick={() => toggleItem(product.id)}
                                    >
                                        <Checkbox
                                            checked={selectedItems.includes(product.id)}
                                            onCheckedChange={() => toggleItem(product.id)}
                                            className="mr-4"
                                        />
                                        <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0 mr-3">
                                            <img src={getDirectUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">₹{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                                {availableProducts.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No regular products found to bundle.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Center/Right: Configuration & Preview */}
                    <Card className="lg:col-span-2 border-gold/20 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Gift className="w-40 h-40 text-gold" />
                        </div>

                        <CardHeader className="pb-6">
                            <CardTitle className="text-2xl font-heading">
                                {editingId ? "Edit Gift Set" : "Configure Your Bundle"}
                            </CardTitle>
                            <CardDescription>Set the price and details for your new Gift Set.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 relative z-10">
                            {/* ... (Existing form content kept implicitly by not replacing inner logic, just wrapping) ... */}
                            {/* Wait, replace_file_content needs full block replacement. I must include the inner content or use multi_replace. */}
                            {/* Since the block is huge, I will use the StartLine/EndLine carefully to wrap it. */}
                            {/* Actually, the tool call above has the full content of the builder section in the 'ReplacementContent' variable? No, I need to provide it. */}
                            {/* Re-reading the tool definition: 'ReplacementContent' must be the complete new text. */}
                            {/* Using the previous view_file output, lines 206-355 covers the grid. */}
                            {/* I will paste the logic back in. */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Bundle Name</Label>
                                        <Input
                                            value={bundleName}
                                            onChange={(e) => setBundleName(e.target.value)}
                                            placeholder="e.g., The Holiday Collection"
                                            className="font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Image URL <span className="text-xs text-muted-foreground font-normal">(Optional)</span></Label>
                                        <Input
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(getDirectUrl(e.target.value))}
                                            placeholder="Paste link (ImgBB, etc)..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description <span className="text-xs text-muted-foreground font-normal">(Optional)</span></Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe this amazing collection..."
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4">

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Selected Items:</span>
                                            <span className="font-bold">{selectedProducts.length}</span>
                                        </div>

                                        <div className="pt-4 border-t border-border">
                                            <Label className="text-gold font-bold mb-1.5 block">Bundle Price (₹)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                                <Input
                                                    type="number"
                                                    value={offerPrice}
                                                    onChange={(e) => setOfferPrice(e.target.value)}
                                                    className="pl-7 font-bold text-lg h-12 border-gold/30 focus:border-gold"
                                                    placeholder="2499"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    {imageUrl && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                                            <img src={getDirectUrl(imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold">Image Preview</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Advanced Settings Accordion */}
                            <Accordion type="single" collapsible className="w-full border rounded-lg bg-muted/10">

                                {/* Reviews Manager (Only for existing) */}
                                {editingId && (
                                    <AccordionItem value="reviews">
                                        <AccordionTrigger className="px-4">Reviews Manager</AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <AdminReviewManager productId={editingId} />
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>

                            <div className="pt-4 flex justify-end gap-4">
                                {editingId && (
                                    <Button variant="outline" onClick={handleCancelEdit}>
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    size="lg"
                                    className="bg-gold hover:bg-gold/90 text-white w-full md:w-auto min-w-[200px]"
                                    onClick={handlePublish}
                                    disabled={loading || selectedItems.length === 0}
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    {editingId ? "Update Gift Set" : "Publish Gift Set"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="bg-muted/10 border border-gold/20 rounded-xl p-8 text-center animate-fade-in">
                    <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8 text-gold" />
                    </div>
                    <h3 className="text-xl font-heading mb-2">Gift Set Limit Reached</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        You can only have one active gift set at a time. To make changes, please edit the existing set below.
                    </p>
                </div>
            )}

            {/* Existing Gift Sets List */}
            <div className="pt-8 border-t border-border">
                <h3 className="text-xl font-heading mb-6">Active Gift Sets</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {existingGiftSets.map(gs => (
                        <div key={gs.id} className="group bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex gap-4 relative">
                            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                {gs.images.length > 0 ? (
                                    <img src={getDirectUrl(gs.images[0])} alt={gs.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gold/10">
                                        <Gift className="text-gold w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg leading-tight mb-1">{gs.name}</h4>
                                <p className="text-gold font-bold">₹{gs.price}</p>
                                <p className="text-xs text-muted-foreground mt-2">{gs.bundleItems ? `${gs.bundleItems.length} items bundled` : 'Legacy Bundle'}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleEdit(gs)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(gs.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {existingGiftSets.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
                            No active gift sets. Create one above!
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default GiftSetBuilder;
