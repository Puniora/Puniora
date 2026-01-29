import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { whatsappService } from "@/lib/services/whatsappService";
import { toast } from "sonner";
import { products } from "@/lib/products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TestWhatsApp = () => {
  const [phone, setPhone] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTest = async () => {
    if (!phone) {
      toast.error("Enter a phone number");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

      // Create a dummy order object with REAL product data
      const dummyOrder: any = {
        id: "TEST-" + Math.floor(Math.random() * 10000),
        customer_name: "Test User",
        customer_mobile: phone,
        items: [
            {
                name: selectedProduct.name,
                // Image not sent anymore
                // image: `https://placehold.co/600x400/png?text=${encodeURIComponent(selectedProduct.name)}`
            }
        ]
      };

      console.log("Sending test message to:", phone);
      console.log("Product:", selectedProduct.name);
      console.log("Image URL (Public):", dummyOrder.items[0].image);
      
      const res = await whatsappService.sendOrderConfirmation(dummyOrder);
      console.log("Response:", res);
      
      setResult("SUCCESS: " + JSON.stringify(res, null, 2));
      toast.success(`Message sent with ${selectedProduct.name}! Check WhatsApp.`);
    } catch (error: any) {
      console.error("Test Error:", error);
      setResult("ERROR: " + (error.message || JSON.stringify(error)));
      toast.error("Failed to send message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Test WhatsApp Message</h1>
        <p className="text-sm text-gray-500">
          Enter your verified number (e.g. 917305891613).
        </p>
      </div>
      
      <div className="space-y-4">
        <Input 
          placeholder="Phone: 919876543210" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
        />

        <div className="space-y-2">
            <label className="text-sm font-medium">Select Product Image to Send:</label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
                <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
                {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                    {product.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <Button onClick={handleTest} disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send Test Message"}
        </Button>
      </div>

      {result && (
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto mt-4 whitespace-pre-wrap border border-gray-300 h-64">
          {result}
        </pre>
      )}
    </div>
  );
};

export default TestWhatsApp;
