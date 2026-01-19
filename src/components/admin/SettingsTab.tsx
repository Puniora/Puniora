import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { settingsService } from "@/lib/services/settingsService";
import { productService } from "@/lib/services/productService"; // Import product service for upload
import { toast } from "sonner";
import { Loader2, Save, Image as ImageIcon, X, MessageSquare } from "lucide-react";

const SettingsTab = () => {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");
  const [enableBanner, setEnableBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);



  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try fetching the new array setting
      const images = await settingsService.getJsonSetting<string[]>("hero_images", []);
      
      if (images && images.length > 0) {
        // Auto-fix existing links on load
        const fixedImages = images.map(img => getDirectUrl(img));
        setHeroImages(fixedImages);
        
        // If corrections were made, could optionally auto-save, but let's just show them correctly first
        // so user sees them working and can hit save if they want.
      } else {
        // Fallback/Migration: Check for old single image setting
        const oldUrl = await settingsService.getSetting("hero_image_url");
        if (oldUrl) {
          setHeroImages([getDirectUrl(oldUrl)]);
        }
      }

      // Fetch banner settings
      const bannerEnabled = await settingsService.getSetting("banner_enabled");
      setEnableBanner(bannerEnabled === "true"); 
      const bannerText = await settingsService.getSetting("banner_text");
      setBannerText(bannerText || "");

    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const results = await Promise.all([
        settingsService.updateSetting("hero_images", heroImages),
        settingsService.updateSetting("banner_enabled", String(enableBanner)),
        settingsService.updateSetting("banner_text", bannerText)
      ]);
      
      const allSuccess = results.every(r => r.success);
      
      if (allSuccess) {
        // Verification: fetch it back to ensure it stored
        const stored = await settingsService.getJsonSetting<string[]>("hero_images", []);
        if (stored && stored.length === heroImages.length) {
          toast.success("Settings saved successfully");
        } else {
          toast.warning("Settings saved but verification failed. Please refresh to check.");
        }
      } else {
        toast.error("Failed to save settings: " + (results.find(r => !r.success)?.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };





  const getDirectUrl = (url: string) => {
    if (!url) return url;
    
    // Handle Dropbox links
    if (url.includes("dropbox.com")) {
      return url.replace("dl=0", "raw=1");
    }

    return url;
  };

  const validateUrl = (url: string): string | null => {
    // Check for ImgBB viewer links (common mistake)
    if (url.includes("ibb.co") && !url.includes("i.ibb.co")) {
      return "For ImgBB, please copy the 'Direct Link' (ends in .jpg/.png), not the Viewer link.";
    }
    return null;
  };

  const addImage = () => {
    if (!newImage.trim()) return;
    
    const validationError = validateUrl(newImage.trim());
    if (validationError) {
      toast.warning("Invalid Link Format", {
        description: validationError,
        duration: 6000,
      });
      return;
    }

    const directUrl = getDirectUrl(newImage.trim());
    setHeroImages([...heroImages, directUrl]);
    setNewImage("");
    toast.success("Image added! Don't forget to Save.");
  };

  const removeImage = (index: number) => {
    const newImages = [...heroImages];
    newImages.splice(index, 1);
    setHeroImages(newImages);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Manage global configuration for your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gold" />
              Hero Section Images
            </h3>
            
            <div className="grid gap-2">
              <Label htmlFor="hero-image">Add Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="hero-image"
                  placeholder="Paste image link here..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addImage()}
                  className="flex-1"
                />
                <Button onClick={addImage} type="button" variant="default">Add URL</Button>
                <div className="relative">
                 {/* Upload Button Removed */}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a direct link from <strong>ImgBB or Dropbox</strong> to save database space. 
              </p>
            </div>

            <div className="space-y-4 mt-6">
               <Label>Current Images ({heroImages.length})</Label>
               {heroImages.length === 0 && (
                 <p className="text-sm text-muted-foreground italic">No images added. Default banner will be used.</p>
               )}
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {heroImages.map((img, index) => (
                   <div key={index} className="relative group rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all">
                     <div className="aspect-video w-full bg-muted">
                       <img 
                         src={img} 
                         alt={`Hero ${index + 1}`} 
                         className="object-cover w-full h-full"
                         onError={(e) => {
                           // Try one more fallback for some drive links or just show placeholder
                           const target = e.target as HTMLImageElement;
                           if (!target.src.includes('placehold.co')) {
                              target.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                           }
                         }}
                       />
                       {/* Overlay for better text readability and actions */}
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                     </div>
                     
                     <div className="absolute top-2 right-2 flex gap-2">
                       <button
                         onClick={() => removeImage(index)}
                         className="bg-background/80 hover:bg-destructive text-destructive hover:text-white p-2 rounded-full backdrop-blur-sm transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                         title="Remove Image"
                       >
                         <X className="h-4 w-4" />
                       </button>
                     </div>

                     <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md p-3 border-t border-border translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                       <p className="text-[10px] text-muted-foreground truncate font-mono select-all">
                         {img}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Announcement Banner Section */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gold" />
              Announcement Banner
            </h3>
            
            <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/10">
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label className="text-base font-bold">Show Banner</Label>
                   <p className="text-sm text-muted-foreground">Display an animated banner at the top of the site.</p>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Label htmlFor="banner-mode" className="text-xs text-muted-foreground">
                    {enableBanner ? "Enabled" : "Disabled"}
                   </Label>
                   <Switch
                     id="banner-mode"
                     checked={enableBanner}
                     onCheckedChange={setEnableBanner}
                   />
                 </div>
               </div>

               {enableBanner && (
                 <div className="space-y-2 animate-fade-in">
                   <Label>Banner Message</Label>
                   <Input 
                     value={bannerText}
                     onChange={(e) => setBannerText(e.target.value)}
                     placeholder="e.g. Free Shipping on Orders over ₹999!"
                   />
                 </div>
               )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold/90 text-white">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
