import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, CreditCard, ChevronLeft, Loader2, Locate, MapPinned, Sparkles, ArrowLeft, ShieldCheck, Wallet, CheckCircle2, Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/products";
import { orderService } from "@/lib/services/orderService";
import { shiprocketService } from "@/lib/services/shiprocketService";
import { razorpayService } from "@/lib/services/razorpayService";
import { whatsappService } from "@/lib/services/whatsappService";

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [razorpayError, setRazorpayError] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("checkoutFormData");
    return saved ? JSON.parse(saved) : {
      name: "",
      email: "",
      mobile: "",
      state: "",
      district: "",
      place: "",
      pincode: "",
      houseAddress: "",
      landmark: ""
    };
  });

  useEffect(() => {
    // Check for payment success from Mock Gateway
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_success") === "true") {
        completeOrderCreation('paid', 'UPI_' + Date.now());
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (items.length === 0 && !showConfirmation) {
      navigate("/");
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      userService.getAddresses(user.id).then(setSavedAddresses);
      // Auto-fill email if not set
      if (!formData.email) {
          setFormData(prev => ({ ...prev, email: user.email }));
      }
    }
  }, [user]);

  const fillAddress = (addr: Address) => {
    setFormData({
      name: addr.full_name,
      mobile: addr.phone,
      state: addr.state,
      district: addr.district || "",
      place: addr.city,
      pincode: addr.pincode, // Using correct property from Address interface
      houseAddress: addr.address_line1,
      landmark: addr.address_line2 || "" // Using address_line2 as landmark/area for simplicity
    });
    
    // Automatically verify pincode for saved addresses
    if (addr.pincode) {
        setIsServiceable(true);
    }
  };

  const handleAddressSelect = (value: string) => {
    setSelectedAddressId(value);
    if (value === "new") {
      setFormData({
        name: "", mobile: "", state: "", district: "", place: "", pincode: "", houseAddress: "", landmark: ""
      });
    } else {
      const addr = savedAddresses.find(a => a.id === value);
      if (addr) fillAddress(addr);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("razorpay");

  const subTotal = totalPrice; // Sum of special prices.
  
  // New Calculation as per request: 
  // GST = 18% of the Total Price
  // Base Price = Total Price - GST (which is 82% of Total)
  const gstComponent = Number((subTotal * 0.18).toFixed(2));
  const basePrice = Number((subTotal - gstComponent).toFixed(2));
  
  // Discount is 5% of the total inclusive price
  const discountAmount = paymentMethod === 'razorpay' ? Number((subTotal * 0.05).toFixed(2)) : 0;
  
  // Final total is subTotal (which includes GST) minus any discount
  const finalTotal = Number((subTotal - discountAmount).toFixed(2));

  useEffect(() => {
    localStorage.setItem("checkoutFormData", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
    
    if (id === 'pincode') {
        setIsServiceable(null); // Reset verification on change
        if (value.length === 6) {
            checkPincodeServiceability(value);
        }
    }
  };

  const checkPincodeServiceability = async (pincode: string) => {
      setCheckingServiceability(true);
      try {
          // Bypass Shiprocket check - Enable delivery everywhere
          // const res = await shiprocketService.checkServiceability(pincode);
          // setIsServiceable(res.isServiceable);
          
          setIsServiceable(true);
          toast.success("Delivery available!");
          
      } catch (error) {
          console.error(error);
          // Fallback to true even on error
          setIsServiceable(true);
      } finally {
          setCheckingServiceability(false);
      }
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
          // Reverse geocoding using a public API (OpenStreetMap Nominatim) - Force English
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          const data = await response.json();

          if (data.address) {
            const addr = data.address;
            setFormData((prev: any) => ({
              ...prev,
              state: addr.state || "",
              district: addr.state_district || addr.city_district || "",
              place: addr.city || addr.town || addr.village || "",
              pincode: addr.postcode || "",
              landmark: addr.suburb || addr.neighbourhood || ""
            }));

            
            // Automatically verify pincode since we are enabling delivery everywhere
            if (addr.postcode) {
                setIsServiceable(true);
            }
            
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
    if (!formData.name || !formData.mobile || !formData.place || !formData.pincode) {
      toast.error("Please fill in all required shipping details.");
      return;
    }
    
    if (isServiceable === false) {
        toast.error("We cannot deliver to this address. Please change pincode.");
        return;
    }

    setLoading(true);

    try {
      let finalPaymentStatus: 'pending' | 'paid' = 'pending';
      let razorpayPaymentId = '';



      if (paymentMethod === "razorpay") {
          try {
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID,
              amount: Math.round(finalTotal * 100), // in paise using detailed final total
              currency: "INR",
              name: "Puniora",
              description: "Purchase from Puniora",
              image: `${window.location.origin}/favicon.png`,
              handler: async function (response: any) {
                // Payment Success
                console.log("Razorpay Success:", response);
                await completeOrderCreation('paid', response.razorpay_payment_id);
              },
              prefill: {
                name: formData.name,
                contact: formData.mobile,
                email: user?.email || ""
              },
              theme: {
                color: "#D4AF37", // Gold color
                backdrop_color: "#1a1a1a" // Attempt to darken backdrop if supported by standard checkout (though standard checkout backdrop is usually fixed opacity)
              },
              modal: {
                ondismiss: function() {
                  setLoading(false);
                  toast.info("Payment cancelled");
                },
                // Force a more minimal look if possible via standard options
                animation: true
              }
            };
            
            await razorpayService.openPaymentModal(options);
            // Note: loading state is handled by modal dismiss or success callback
            return;

          } catch (rzpError: any) {
              console.error("Razorpay Error:", rzpError);
              setRazorpayError("Razorpay initialization failed. " + (rzpError.message || ""));
              toast.error("Payment Failed: " + (rzpError.message || "Check console"));
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
        customer_email: user?.email || formData.email,
        address_json: {
          state: formData.state,
          district: formData.district,
          place: formData.place,
          pincode: formData.pincode,
          houseAddress: formData.houseAddress,
          landmark: formData.landmark
        },

        total_amount: finalTotal,
        payment_status: pStatus,
        razorpay_payment_id: pId || undefined,
        user_id: user?.id, // Optional for guests
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

      console.log("Submitting Order Data:", orderData);
      const order = await orderService.createOrder(orderData);

      // 2. Shiprocket Order Creation is handled internally by orderService.createOrder
      // This prevents duplicate creation and ensures consistency.

      // 3. Trigger WhatsApp Notification
      try {
        console.log("Sending WhatsApp Notification...");
        await whatsappService.sendOrderConfirmation(order);
      } catch (waError) {
        console.error("WhatsApp Integration Error:", waError);
      }

      // Cache order ID for tracking
      localStorage.setItem("puniora_last_order", order.id);

      // Clear form data on successful order
      localStorage.removeItem("checkoutFormData");

      // Show confirmation dialog
      setConfirmedOrderId(order.id);
      setShowConfirmation(true);
      clearCart();

    } catch (error: any) {
      console.error("Order completion error:", error);
      toast.error(`Failed to finalize order: ${error.message || JSON.stringify(error)}. Please contact support if payment was deducted.`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 md:pt-32 pb-20 w-full">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center gap-4 mb-8 md:mb-12 animate-fade-in">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gold/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl md:text-5xl font-heading">Complete Your Order</h1>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left: Shipping Form */}
            <div className="space-y-6 md:space-y-10 animate-slide-up w-full">
              <div className="glass p-5 md:p-8 rounded-2xl md:rounded-3xl space-y-6 md:space-y-8 shadow-xl shadow-gold/5 w-full">
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

                  {/* Name, Email, Mobile - Compact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Name</Label>
                      <Input id="name" required placeholder="Full Name" className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.name} onChange={handleInputChange} />
                    </div>

                    {!user && (
                        <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Email (For Updates)</Label>
                        <Input id="email" required type="email" placeholder="your@email.com" className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.email || ""} onChange={handleInputChange} />
                        </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mobile</Label>
                      <Input id="mobile" required type="tel" placeholder="+91..." className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.mobile} onChange={handleInputChange} />
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Address</Label>

                  </div>

                  {/* Address Grid - Compact */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Input id="state" required placeholder="State" className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.state} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-1.5">
                      <Input id="district" required placeholder="District" className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.district} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-1.5">
                      <Input id="place" required placeholder="City/Town" className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.place} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-1.5">
                      <Input id="landmark" placeholder="Landmark" className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.landmark} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5 relative">
                      <Input 
                        id="pincode" 
                        required 
                        placeholder="Pincode" 
                        maxLength={6} 
                        className={`h-10 border-border/50 focus:border-gold rounded-xl text-sm ${
                            isServiceable === true ? 'border-green-500 focus:border-green-500' : 
                            isServiceable === false ? 'border-red-500 focus:border-red-500' : ''
                        }`} 
                        value={formData.pincode} 
                        onChange={handleInputChange} 
                      />
                      {checkingServiceability && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gold" />}
                      {isServiceable === true && <span className="absolute right-3 top-3 h-2 w-2 bg-green-500 rounded-full" />}
                      {isServiceable === false && <span className="absolute right-3 top-3 h-2 w-2 bg-red-500 rounded-full" />}
                  </div>

                  <div className="space-y-1.5">
                    <Input id="houseAddress" required placeholder="Address / House No." className="h-10 border-border/50 focus:border-gold rounded-xl text-sm" value={formData.houseAddress} onChange={handleInputChange} />
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

                <RadioGroup value={paymentMethod} onValueChange={(val: "cod" | "razorpay") => {
                  setPaymentMethod(val);
                  setRazorpayError(null);
                }} className="space-y-4">
                  <div className={`flex items-center space-x-4 border rounded-xl p-4 transition-all duration-300 ${paymentMethod === 'cod' ? 'border-gold bg-gold/5 shadow-md' : 'border-border/50 hover:border-gold/50'}`}>
                    <RadioGroupItem value="cod" id="cod" className="text-gold border-gold" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-heading text-lg">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay with cash when your order arrives.</div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-4 border rounded-xl p-4 transition-all duration-300 ${paymentMethod === 'razorpay' ? 'border-blue-500 bg-blue-500/5 shadow-md' : 'border-border/50 hover:border-blue-500/50'}`}>
                    <RadioGroupItem value="razorpay" id="razorpay" className="text-blue-500 border-blue-500 mt-1 self-start" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-heading text-lg">Online Payment</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold tracking-wider">SECURE</span>
                          <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold tracking-wider shadow-sm animate-pulse">5% OFF</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground leading-snug">Credit/Debit Card, UPI, NetBanking (via Razorpay)</div>
                    </Label>
                  </div>

                  {razorpayError && paymentMethod === 'razorpay' && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs mt-2">
                          <p>{razorpayError}</p>
                      </div>
                  )}
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

                <div className="space-y-6">
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
                    <span className="text-sm uppercase tracking-widest font-bold opacity-70">Original Price (excl. GST)</span>
                    <span className="font-medium">{formatPrice(basePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-muted-foreground">
                     <span className="text-sm uppercase tracking-widest font-bold opacity-70">GST (18%)</span>
                     <span className="font-medium">{formatPrice(gstComponent)}</span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-sm uppercase tracking-widest font-bold opacity-70">Shipping</span>
                    <span className="text-gold font-bold text-xs">FREE</span>
                  </div>

                  {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-green-500">
                      <span className="text-sm uppercase tracking-widest font-bold opacity-90">Online Discount (5%)</span>
                      <span className="font-bold text-xs">- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <span className="text-xl font-heading">Total Payable</span>
                    <span className="text-2xl font-heading text-gold">{formatPrice(finalTotal)}</span>
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

      {/* Order Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={(open) => {
        setShowConfirmation(open);
        if (!open) navigate("/");
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <DialogTitle className="text-3xl font-heading">Order Confirmed!</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Your order has been placed successfully.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Thank you for your purchase! Your order has been successfully placed.
              </p>
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Order ID</p>
                <p className="font-mono text-sm break-all">{confirmedOrderId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gold/5 p-4 rounded-xl border border-gold/20">
              <Package className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-bold text-gold">What's Next?</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  We'll send you order updates via SMS. You can track your order anytime from your account.
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowConfirmation(false);
                navigate("/");
              }}
              className="w-full bg-gold hover:bg-gold/90 text-white h-12"
            >
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
