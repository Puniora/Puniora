

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService, Order } from "@/lib/services/orderService";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Package, MapPin, ChevronRight, ArrowLeft, Clock, User, Phone, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const TrackOrder = () => {
   const [phoneNumber, setPhoneNumber] = useState("");
   const [orders, setOrders] = useState<Order[] | null>(null);
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      // Auto-fill from localStorage if available (optional enhancement)
      const savedPhone = localStorage.getItem("puniora_last_phone");
      if (savedPhone) {
         setPhoneNumber(savedPhone);
      }
   }, []);

   const handleTrack = async () => {
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
         toast.error("Please enter a valid Phone Number");
         return;
      }

      try {
         setLoading(true);
         setOrders(null);
         setSelectedOrder(null);

         const data = await orderService.getOrdersByMobile(phoneNumber.trim());

         if (data && data.length > 0) {
            setOrders(data);
            localStorage.setItem("puniora_last_phone", phoneNumber.trim());
         } else {
            setOrders([]);
            toast.error("No orders found for this number.");
         }
      } catch (error) {
         console.error("Tracking error:", error);
         toast.error("Failed to fetch orders. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   const statusSteps = [
      { label: "Order Placed", icon: Clock },
      { label: "Packed", icon: Package },
      { label: "Shipped", icon: Package },
      { label: "Out for Delivery", icon: MapPin },
      { label: "Delivered", icon: ChevronRight },
   ];

   // Helper to get status index
   const getStatusIndex = (status: string) => statusSteps.findIndex(s => s.label === status);

   return (
      <div className="min-h-screen bg-background flex flex-col">
         <Header />

         <main className="flex-1 pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
               <div className="text-center space-y-4 mb-12">
                  <h1 className="text-4xl md:text-5xl font-heading">Track Your Orders</h1>
                  <p className="text-muted-foreground italic">Enter your mobile number to view all your fragrance orders and their status.</p>
               </div>

               <div className="glass p-8 rounded-3xl shadow-xl shadow-gold/5 mb-12">
                  <div className="flex flex-col md:flex-row gap-4">
                     <div className="relative flex-1">
                        <Input
                           placeholder="Enter Mobile Number (e.g. 9876543210)"
                           className="h-14 rounded-2xl border-border/50 focus:border-gold pl-12 italic tracking-widest"
                           value={phoneNumber}
                           onChange={(e) => setPhoneNumber(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                           type="tel"
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                     </div>
                     <Button
                        onClick={handleTrack}
                        disabled={loading}
                        variant="gold"
                        size="xl"
                        className="h-14 px-10 rounded-2xl shadow-lg shadow-gold/20"
                     >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "FIND ORDERS"}
                     </Button>
                  </div>
               </div>

               {/* Result Section */}
               <div className="space-y-8 animate-slide-up">

                  {/* Case: Orders Found */}
                  {orders && orders.length > 0 && !selectedOrder && (
                     <div className="space-y-6">
                        <h2 className="text-xl font-heading">Found {orders.length} Order(s)</h2>
                        <div className="grid gap-6">
                           {orders.map((order) => (
                              <div
                                 key={order.id}
                                 onClick={() => setSelectedOrder(order)}
                                 className="glass p-6 rounded-2xl border border-border/50 hover:border-gold/30 hover:shadow-lg transition-all cursor-pointer group"
                              >
                                 <div className="flex justify-between items-start mb-4">
                                    <div>
                                       <div className="flex items-center gap-3 mb-1">
                                          <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-bold bg-gold/5 text-gold border-gold/20">
                                             {order.tracking_status}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                             <Calendar className="h-3 w-3" />
                                             {new Date(order.created_at).toLocaleDateString()}
                                          </span>
                                       </div>
                                       <h3 className="font-bold text-lg mt-2">Order #{order.id.slice(0, 8)}</h3>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors">
                                       <ChevronRight className="h-4 w-4" />
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                       <div key={idx} className="h-12 w-12 bg-white rounded-lg border border-border p-1 shrink-0">
                                          {item.image ? (
                                             <img src={item.image} className="w-full h-full object-contain" alt="" />
                                          ) : <div className="w-full h-full bg-muted" />}
                                       </div>
                                    ))}
                                    {order.items.length > 3 && (
                                       <div className="h-12 w-12 bg-muted/20 rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground">
                                          +{order.items.length - 3}
                                       </div>
                                    )}
                                    <div className="ml-auto flex flex-col items-end">
                                       <span className="text-[10px] uppercase text-muted-foreground font-bold">Total</span>
                                       <span className="text-lg font-bold text-gold">{formatPrice(order.total_amount)}</span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Case: No Orders Found */}
                  {orders && orders.length === 0 && (
                     <div className="text-center py-12 glass rounded-3xl">
                        <p className="text-muted-foreground italic">No orders found for this number.</p>
                     </div>
                  )}

                  {/* Case: Selected Order Detail */}
                  {selectedOrder && (
                     <div className="space-y-6">
                        <button
                           onClick={() => setSelectedOrder(null)}
                           className="flex items-center text-sm text-muted-foreground hover:text-gold transition-colors"
                        >
                           <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Orders
                        </button>

                        <div className="glass p-10 rounded-3xl border-gold/10 animate-fade-in">
                           <div className="flex justify-between items-center mb-10">
                              <div className="space-y-1">
                                 <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Order #{selectedOrder.id.slice(0, 8)}</p>
                                 <h2 className="text-2xl font-heading">{selectedOrder.tracking_status}</h2>
                              </div>
                              <div className="text-right hidden md:block">
                                 <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Placed On</p>
                                 <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>

                           <div className="relative pt-10 pb-4">
                              {/* Progress Bar Background */}
                              <div className="absolute top-[52px] left-[5%] right-[5%] h-1 bg-muted/30 rounded-full" />
                              {/* Progress Bar Active */}
                              <div
                                 className="absolute top-[52px] left-[5%] h-1 bg-gold rounded-full transition-all duration-1000 ease-out"
                                 style={{ width: `${(getStatusIndex(selectedOrder.tracking_status) / (statusSteps.length - 1)) * 90}%` }}
                              />

                              <div className="relative flex justify-between">
                                 {statusSteps.map((step, index) => {
                                    const idx = getStatusIndex(selectedOrder.tracking_status);
                                    const isCompleted = index <= idx;
                                    const isCurrent = index === idx;
                                    return (
                                       <div key={step.label} className="flex flex-col items-center group w-1/5">
                                          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 ${isCompleted ? 'bg-gold border-gold text-white scale-110 shadow-lg shadow-gold/30' : 'bg-white border-muted-foreground/20 text-muted-foreground opacity-50'
                                             }`}>
                                             <step.icon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                                          </div>
                                          <span className={`mt-4 text-[9px] uppercase tracking-widest font-bold text-center leading-tight transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                             }`}>
                                             {step.label}
                                          </span>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>

                           {selectedOrder.tracking_id && (
                              <div className="mt-12 bg-gold/5 border border-gold/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                 <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gold/10 rounded-xl flex items-center justify-center">
                                       <Package className="h-5 w-5 text-gold" />
                                    </div>
                                    <div>
                                       <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Courier / Tracking ID</p>
                                       <p className="font-bold tracking-wider">{selectedOrder.tracking_id}</p>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Order Summary & Shipping */}
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="glass p-8 rounded-3xl space-y-6">
                              <h3 className="text-xl font-heading border-b border-border/50 pb-4">Shipping Details</h3>
                              <div className="space-y-4 text-sm italic text-muted-foreground">
                                 <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-gold" />
                                    <span className="font-bold text-foreground not-italic">{selectedOrder.customer_name}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gold" />
                                    <span>{selectedOrder.customer_mobile}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-gold" />
                                    <span>
                                       {selectedOrder.address_json.houseAddress}, {selectedOrder.address_json.place}<br />
                                       {selectedOrder.address_json.district}, {selectedOrder.address_json.state}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="glass p-8 rounded-3xl space-y-6">
                              <h3 className="text-xl font-heading border-b border-border/50 pb-4">Order Summary</h3>
                              <div className="space-y-4">
                                 {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-medium">
                                       <span>{item.name} <span className="text-muted-foreground italic">(x{item.quantity})</span></span>
                                       <span>{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                 ))}
                                 <div className="pt-4 border-t border-border/30 flex justify-between items-center">
                                    <span className="font-heading">Total Paid</span>
                                    <span className="text-xl font-heading text-gold">{formatPrice(selectedOrder.total_amount)}</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase font-bold text-muted-foreground">Payment Status</span>
                                    <Badge
                                       variant={selectedOrder.payment_status === 'paid' ? 'default' : selectedOrder.payment_status === 'failed' ? 'destructive' : 'secondary'}
                                       className="uppercase text-[9px] font-bold"
                                    >
                                       {selectedOrder.payment_status}
                                    </Badge>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

               </div>

               <div className="mt-12 text-center">
                  <Link to="/" className="text-sm text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-2">
                     <ArrowLeft className="h-4 w-4" /> Back to Boutique
                  </Link>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
};

export default TrackOrder;
