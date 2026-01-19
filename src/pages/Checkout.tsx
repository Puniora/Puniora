import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, ArrowLeft, Loader2, ShieldCheck, CreditCard, Wallet } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/products";
import { orderService } from "@/lib/services/orderService";
import { shiprocketService } from "@/lib/services/shiprocketService";
import { razorpayService } from "@/lib/services/razorpayService"; // Import Razorpay
import { useAuth } from "@/context/AuthContext";
import { userService, Address } from "@/lib/services/userService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("checkoutFormData");
    return saved ? JSON.parse(saved) : {
      name: "",
      mobile: "",
      state: "",
      district: "",
      place: "",
      houseAddress: "",
      landmark: ""
    };
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate("/");
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      userService.getAddresses(user.id).then(setSavedAddresses);
    }
  }, [user]);

  const fillAddress = (addr: Address) => {
    setFormData({
      name: addr.full_name,
      mobile: addr.phone,
      state: addr.state,
      district: "", // Address object from DB might not strictly split district/place the same way or it might be needed to map differently. 
      // For now, mapping best effort. 
      place: addr.city, 
      houseAddress: addr.address_line1,
      landmark: addr.address_line2 || "" // Using address_line2 as landmark/area for simplicity
    });
  };

  const handleAddressSelect = (value: string) => {
    setSelectedAddressId(value);
    if (value === "new") {
      setFormData({
         name: "", mobile: "", state: "", district: "", place: "", houseAddress: "", landmark: ""
      });
    } else {
      const addr = savedAddresses.find(a => a.id === value);
      if (addr) fillAddress(addr);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  useEffect(() => {
    localStorage.setItem("checkoutFormData", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding using a public API (OpenStreetMap Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.address) {
            const addr = data.address;
            setFormData((prev: any) => ({
              ...prev,
              state: addr.state || "",
              district: addr.state_district || addr.city_district || "",
              place: addr.city || addr.town || addr.village || "",
              landmark: addr.suburb || addr.neighbourhood || ""
            }));
            toast.success("Location updated!");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error("Failed to fetch address details");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Permission denied or location unavailable");
        setGeoLoading(false);
      }
    );
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations (Native required props usually handle this, but good to be safe)
    if (!formData.name || !formData.mobile || !formData.place) {
      toast.error("Please fill in all required shipping details.");
      return;
    }

    setLoading(true);

    try {
      let finalPaymentStatus: 'pending' | 'paid' = 'pending';
      let razorpayPaymentId = '';

      if (paymentMethod === "online") {
        try {
           const options = {
             key: import.meta.env.VITE_RAZORPAY_KEY_ID || "", 
             amount: Math.round(totalPrice * 100), // Amount in paise
             currency: "INR",
             name: "Puniora",
             description: "Luxury Fragrance Purchase",
             image: "/logo.png", // Optional, ensure path is correct or omit
             handler: function (response: any) {
                // Payment Success!
                // Trigger the actual order creation
                razorpayPaymentId = response.razorpay_payment_id;
                finalPaymentStatus = 'paid';
                completeOrderCreation(finalPaymentStatus, razorpayPaymentId);
             },
             prefill: {
               name: formData.name,
               email: user?.email, // Or request email in form
               contact: formData.mobile
             },
             theme: {
               color: "#D4AF37" // Gold color
             },
             modal: {
               ondismiss: function() {
                 setLoading(false);
                 toast.info("Payment Cancelled");
               }
             }
           };
           
           await razorpayService.openPaymentModal(options);
           // execution halts here until modal handles it, but typically handler is callback-based. 
           // The service wrapper returns a promise that resolves on open, not on complete.
           // So we return here and let the handler call completeOrderCreation.
           return; 

        } catch (pzError: any) {
           console.error("Razorpay Error:", pzError);
           toast.error(pzError.message || "Payment initiation failed");
           setLoading(false);
           return;
        }
      }

      // Default COD Flow
      await completeOrderCreation('pending', '');

    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const completeOrderCreation = async (pStatus: 'pending' | 'paid', pId: string) => {
      try {
        // 1. Create order in our database
        const orderData = {
          customer_name: formData.name,
          customer_mobile: formData.mobile,
          address_json: {
            state: formData.state,
            district: formData.district,
            place: formData.place,
            houseAddress: formData.houseAddress,
            landmark: formData.landmark
          },
  
          total_amount: totalPrice,
          payment_status: pStatus,
          razorpay_payment_id: pId || undefined,
          user_id: user?.id,
          items: items.map(i => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            image: i.product.images[0],
            size: i.product.size,
            note: i.product.selectedNote
          }))
        };
  
        const order = await orderService.createOrder(orderData);
  
        // 2. Trigger Shiprocket Order Creation
        try {
          console.log("Creating Shiprocket Order...");
          // Only create shiprocket order if COD or Paid. (Pending online orders shouldn't ship yet)
          // Since we only reach here if Paid (Online) or Pending (COD), we are good.
          
          const shiprocketRes = await shiprocketService.createOrder(order);
          
          if (shiprocketRes && shiprocketRes.order_id) {
             console.log("Shiprocket Order Created:", shiprocketRes.order_id);
             
             await orderService.updateShiprocketDetails(order.id, {
               shiprocket_order_id: shiprocketRes.order_id.toString(),
               shiprocket_shipment_id: shiprocketRes.shipment_id.toString(),
               awb_code: shiprocketRes.awb_code || ""
             });
             
             await orderService.updateTracking(
                order.id, 
                'Order Placed', 
                shiprocketRes.shipment_id ? shiprocketRes.shipment_id.toString() : undefined
             );
          }
        } catch (srError) {
           console.error("Shiprocket Integration Error:", srError);
        }
  
        // Cache order ID for tracking
        localStorage.setItem("puniora_last_order", order.id);
  
        // Clear form data on successful order
        localStorage.removeItem("checkoutFormData");
  
        toast.success(pStatus === 'paid' ? "Payment Successful! Order Placed." : "Order Placed Successfully!");
        clearCart();
        navigate("/");
        
      } catch (error) {
         console.error("Order completion error:", error);
         toast.error("Failed to finalize order. Please contact support if payment was deducted.");
      } finally {
         setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex items-center gap-4 mb-12 animate-fade-in">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gold/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl md:text-5xl font-heading">Complete Your Order</h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Shipping Form */}
            <div className="space-y-10 animate-slide-up">
              <div className="glass p-8 rounded-3xl space-y-8 shadow-xl shadow-gold/5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gold/10 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <h2 className="text-2xl font-heading">Shipping Details</h2>
                </div>

                <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
                  
                  {/* Saved Addresses Dropdown */}
                  {user && savedAddresses.length > 0 && (
                    <div className="space-y-2 pb-4 border-b border-border/50">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Saved Addresses</Label>
                      <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                        <SelectTrigger className="h-12 border-gold/30 bg-gold/5 rounded-xl">
                          <SelectValue placeholder="Select a saved address" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Use a New Address</SelectItem>
                          {savedAddresses.map(addr => (
                            <SelectItem key={addr.id} value={addr.id}>
                              {addr.full_name} - {addr.address_line1}, {addr.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Name</Label>
                      <Input id="name" required placeholder="John Doe" className="h-12 border-border/50 focus:border-gold rounded-xl italic" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mobile Number</Label>
                      <Input id="mobile" required type="tel" placeholder="+91 XXXX XXX XXX" className="h-12 border-border/50 focus:border-gold rounded-xl italic" value={formData.mobile} onChange={handleInputChange} />
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Delivery Address</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={geoLoading}
                      className="text-gold hover:text-gold hover:bg-gold/10 gap-2 h-8 px-3 rounded-full border border-gold/20"
                    >
                      {geoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                      {geoLoading ? "Locating..." : "Use Current Location"}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Input id="state" required placeholder="State" className="h-12 border-border/50 focus:border-gold rounded-xl italic" value={formData.state} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Input id="district" required placeholder="District" className="h-12 border-border/50 focus:border-gold rounded-xl italic" value={formData.district} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Input id="place" required placeholder="City / Place / Town" className="h-12 border-border/50 focus:border-gold rounded-xl italic" value={formData.place} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Input id="landmark" placeholder="Landmark (Optional)" className="h-12 border-border/50 focus:border-gold rounded-xl italic" value={formData.landmark} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input id="houseAddress" required placeholder="House Name / Buildling Number" className="h-12 border-border/50 focus:border-gold rounded-xl italic" value={formData.houseAddress} onChange={handleInputChange} />
                  </div>
                </form>
              </div>

              <div className="p-8 rounded-3xl bg-muted/20 border border-border/50 flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-gold shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-sm uppercase tracking-wider">Secure Transaction</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    Your data is encrypted and secure. We do not store your credit card or payment details on our servers.
                  </p>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl space-y-8 shadow-xl shadow-gold/5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gold/10 rounded-xl flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-gold" />
                  </div>
                  <h2 className="text-2xl font-heading">Payment Method</h2>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={(val: "cod" | "online") => setPaymentMethod(val)} className="space-y-4">
                  <div className={`flex items-center space-x-4 border rounded-xl p-4 transition-all duration-300 ${paymentMethod === 'cod' ? 'border-gold bg-gold/5 shadow-md' : 'border-border/50 hover:border-gold/50'}`}>
                    <RadioGroupItem value="cod" id="cod" className="text-gold border-gold" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-heading text-lg">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay with cash when your order arrives.</div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-4 border rounded-xl p-4 transition-all duration-300 ${paymentMethod === 'online' ? 'border-gold bg-gold/5 shadow-md' : 'border-border/50 hover:border-gold/50'}`}>
                    <RadioGroupItem value="online" id="online" className="text-gold border-gold" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      <div className="font-heading text-lg flex items-center gap-2">
                        Online Payment
                        <span className="text-[10px] bg-gold text-primary-foreground px-2 py-0.5 rounded-full font-bold tracking-wider">SECURE</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Netbanking.</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:sticky lg:top-36 space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="glass p-8 rounded-3xl space-y-8 shadow-xl shadow-gold/5 flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gold/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-gold" />
                  </div>
                  <h2 className="text-2xl font-heading">Order Summary</h2>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 group">
                      <div className="h-20 w-16 bg-muted/30 rounded-lg overflow-hidden shrink-0 border border-border/50">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-heading text-lg group-hover:text-gold transition-colors">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest italic">{item.product.size} • Qty: {item.quantity}</p>
                      </div>
                      <div className="flex flex-col justify-center text-right">
                        <p className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-sm uppercase tracking-widest font-bold opacity-70">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-sm uppercase tracking-widest font-bold opacity-70">Shipping</span>
                    <span className="text-gold font-bold text-xs">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <span className="text-xl font-heading">Total</span>
                    <span className="text-2xl font-heading text-gold">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Button
                  form="checkout-form"
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="w-full h-14 shadow-xl shadow-gold/20 relative group overflow-hidden"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <span className="relative z-10 flex items-center gap-3 tracking-widest">
                      {paymentMethod === 'cod' ? "PLACE COD ORDER" : "PROCEED TO PAYMENT"}
                      <CreditCard className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
