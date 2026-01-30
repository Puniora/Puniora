
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsService } from "@/lib/services/settingsService";
import { toast } from "sonner";
import { Loader2, Save, BarChart3, ExternalLink } from "lucide-react";

const AnalyticsTab = () => {
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const gaId = await settingsService.getSetting("google_analytics_id");
      setGoogleAnalyticsId(gaId || "");
    } catch (error) {
      console.error("Failed to fetch analytics settings:", error);
      toast.error("Failed to load analytics settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await settingsService.updateSetting("google_analytics_id", googleAnalyticsId);
      
      if (result.success) {
        toast.success("Analytics settings saved successfully");
      } else {
        toast.error("Failed to save settings: " + (result.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
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
          <CardTitle>Analytics & Integrations</CardTitle>
          <CardDescription>Configure tracking and view your store performance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gold" />
              Google Analytics 4 (GA4)
            </h3>
            
            <div className="grid gap-4 p-4 rounded-xl border border-border bg-muted/10">
                <div className="space-y-2">
                    <Label htmlFor="ga-id">Measurement ID</Label>
                    <div className="flex gap-2">
                        <Input
                            id="ga-id"
                            placeholder="G-XXXXXXXXXX"
                            value={googleAnalyticsId}
                            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                            className="font-mono"
                        />
                        <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold/90 text-white min-w-[120px]">
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Save ID"
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Your GA4 Measurement ID starts with "G-". You can find this in your Google Analytics Admin panel under Data Streams.
                    </p>
                </div>

                {googleAnalyticsId && (
                    <div className="pt-4 border-t border-border mt-2">
                        <Label className="mb-2 block">Quick Actions</Label>
                        <a 
                            href="https://analytics.google.com/analytics/web/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="w-full sm:w-auto gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Open Analytics Dashboard
                                <ExternalLink className="h-3 w-3 opacity-50" />
                            </Button>
                        </a>
                        <p className="text-xs text-muted-foreground mt-2">
                            View real-time reports, user demographics, and sales performance directly on Google Analytics.
                        </p>
                    </div>
                )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
