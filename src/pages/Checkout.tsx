import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, ArrowLeft, Loader2, ShieldCheck, CreditCard, Wallet, CheckCircle2, Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/products";
import { orderService } from "@/lib/services/orderService";
import { shiprocketService } from "@/lib/services/shiprocketService";
import { razorpayService } from "@/lib/services/razorpayService";
import { phonepeService } from "@/lib/services/phonepeService"; // Import PhonePe service
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


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
  const [phonePeError, setPhonePeError] = useState<string | null>(null);

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

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "phonepe">("cod");

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



      if (paymentMethod === "phonepe") {
          try {
              // Initiate PhonePe Payment
              // Note: If running on localhost, this might fail due to CORS.
              // In production, redirection happens, so CORS doesn't matter for the *user* nav, 
              // but the *fetch* call initiation *does* matter.
              
              await phonepeService.initiatePayment({
                  amount: Math.round(totalPrice * 100), // in paise
                  mobileNumber: formData.mobile,
                  merchantUserId: user?.id || "GUEST_" + Date.now()
              });
              
              // If successful, user is redirected away. 
              // We return here.
              return;
              
          } catch (peError: any) {
              if (peError.message === "SIMULATED_SUCCESS") {
                  // Fallback for Demo: Treat as PAID
                  await completeOrderCreation('paid', 'SIMULATED_PHONEPE_' + Date.now());
                  return;
              }
              
              console.error("PhonePe Error:", peError);
              setPhonePeError("PhonePe initialization failed. " + (peError.message || ""));
              toast.error("PhonePe Failed: " + (peError.message || "Check console"));
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

      // Show confirmation dialog
      setConfirmedOrderId(order.id);
      setShowConfirmation(true);
      clearCart();

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

                <RadioGroup value={paymentMethod} onValueChange={(val: "cod" | "phonepe") => {
                  setPaymentMethod(val);
                  setPhonePeError(null);
                }} className="space-y-4">
                  <div className={`flex items-center space-x-4 border rounded-xl p-4 transition-all duration-300 ${paymentMethod === 'cod' ? 'border-gold bg-gold/5 shadow-md' : 'border-border/50 hover:border-gold/50'}`}>
                    <RadioGroupItem value="cod" id="cod" className="text-gold border-gold" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-heading text-lg">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay with cash when your order arrives.</div>
                    </Label>
                  </div>

                  {/* Razorpay Removed */}

                  <div className={`flex items-center space-x-4 border rounded-xl p-4 transition-all duration-300 ${paymentMethod === 'phonepe' ? 'border-purple-500 bg-purple-500/5 shadow-md' : 'border-border/50 hover:border-purple-500/50'}`}>
                    <RadioGroupItem value="phonepe" id="phonepe" className="text-purple-500 border-purple-500" />
                    <Label htmlFor="phonepe" className="flex-1 cursor-pointer">
                      <div className="font-heading text-lg flex items-center gap-2">
                        UPI Payment
                        <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold tracking-wider">FAST</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm, etc.</div>
                    </Label>
                  </div>
                  
                  {phonePeError && paymentMethod === 'phonepe' && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs mt-2">
                          <p>{phonePeError}</p>
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
