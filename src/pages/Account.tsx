import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { userService, Profile, Address } from "@/lib/services/userService";
import { orderService, Order } from "@/lib/services/orderService";
import { shiprocketService } from "@/lib/services/shiprocketService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, MapPin, LogOut, Plus, Trash2, Edit2, Search, ArrowRight, Clock, ChevronRight, Phone, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Account = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected order for detailed view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const cancellationReasons = [
    "Changed my mind",
    "Found a better price",
    "Ordered by mistake",
    "Delivery time is too long",
    "Item not needed anymore",
    "Other"
  ];
  
  const statusSteps = [
      { label: "Order Placed", icon: Clock },
      { label: "Packed", icon: Package },
      { label: "Shipped", icon: Package },
      { label: "Out for Delivery", icon: MapPin },
      { label: "Delivered", icon: ChevronRight },
   ];
   const getStatusIndex = (status: string) => statusSteps.findIndex(s => s.label === status);
   
   const handleCancelOrder = async () => {
     if (!cancelReason) {
       toast.error("Please select a reason for cancellation");
       return;
     }
     
     try {
       setCancelLoading(true);
       
       // 1. Cancel in Shiprocket (if exists)
       if (selectedOrder?.shiprocket_order_id) {
         await shiprocketService.cancelOrder(selectedOrder.shiprocket_order_id);
       }
       
       // 2. Update Local DB
       if (selectedOrder) {
         await orderService.cancelOrder(selectedOrder.id, cancelReason);
       }
       
       toast.success("Order cancelled successfully");
       setIsCancelDialogOpen(false);
       
       // Refresh data
       fetchData();
       setSelectedOrder(null); 
     } catch (error) {
       console.error(error);
       toast.error("Failed to cancel order. Please contact support.");
     } finally {
       setCancelLoading(false);
     }
   };
  
  // Address Form State
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    phone: "",
    is_default: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [profileData, ordersData, addressesData] = await Promise.all([
        userService.getProfile(user.id),
        orderService.getOrdersByUser(user.id, user.email),
        userService.getAddresses(user.id)
      ]);
      setProfile(profileData);
      setOrders(ordersData);
      setAddresses(addressesData);
    } catch (error) {
      console.error("Error fetching account data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress.id, addressForm);
        toast.success("Address updated");
      } else {
        await userService.addAddress({ ...addressForm, user_id: user.id });
        toast.success("Address added");
      }
      setIsAddressOpen(false);
      setEditingAddress(null);
      resetAddressForm();
      // Refresh addresses
      const updatedAddresses = await userService.getAddresses(user.id);
      setAddresses(updatedAddresses);
    } catch (error: any) {
      console.error("Address Save Error:", error);
      if (error.message?.includes("foreign key constraint") || error.details?.includes("is not present in table")) {
         toast.error("Session invalid. Please Logout and Login again.");
      } else {
         toast.error(error.message || "Failed to save address");
      }
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await userService.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      full_name: addr.full_name,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      district: addr.district || "",
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      is_default: addr.is_default
    });
    setIsAddressOpen(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      full_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      phone: "",
      is_default: false
    });
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-40 pb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
           <div className="flex-1">
             <h1 className="text-4xl font-heading text-foreground mb-2">My Account</h1>
             <p className="text-muted-foreground">Welcome back, <span className="text-gold font-bold">{profile?.full_name || user.email}</span></p>
           </div>
           <Button variant="luxuryOutline" onClick={handleLogout} className="border-white/20 text-muted-foreground hover:text-white hover:border-white hover:bg-white/5 gap-2 h-10 px-6 rounded-full transition-all duration-300">
             <LogOut className="h-4 w-4" /> Logout
           </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10 w-fit mx-auto md:mx-0">
            <TabsTrigger value="orders" className="rounded-full px-8 py-2.5 data-[state=active]:bg-white/10 data-[state=active]:text-gold data-[state=active]:border data-[state=active]:border-gold/30 hover:text-white/80 transition-all duration-300">
               My Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-full px-8 py-2.5 data-[state=active]:bg-white/10 data-[state=active]:text-gold data-[state=active]:border data-[state=active]:border-gold/30 hover:text-white/80 transition-all duration-300">
               Address Book
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 animate-fade-in">
             {loading ? (
               <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold" /></div>
             ) : selectedOrder ? (
               // DETAILED ORDER VIEW
                <div className="glass p-8 rounded-3xl max-w-4xl mx-auto animate-slide-up relative overflow-hidden">
                   {/* Background Glow */}
                   <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
                   
                   <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="mb-6 -ml-2 text-muted-foreground hover:text-white hover:bg-white/5 relative z-10">
                      <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to My Orders
                   </Button>
                   
                   <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 relative z-10">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                           <h2 className="text-3xl font-heading text-white">{selectedOrder.tracking_status}</h2>
                           {selectedOrder.tracking_status === 'Cancelled' && <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50">Cancelled</Badge>}
                         </div>
                         <p className="text-sm text-muted-foreground font-mono">Order <span className="text-white">#{selectedOrder.id.slice(0,8)}</span> • Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                      </div>
                       <div className="flex gap-3">
                         <Badge variant="outline" className={`px-4 py-1.5 ${
                             selectedOrder.payment_status === 'paid' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gold border-gold/30 bg-gold/10'
                         }`}>
                             {selectedOrder.payment_status === 'pending' ? 'Cash on Delivery' : selectedOrder.payment_status.toUpperCase()}
                         </Badge>

                         {(selectedOrder.tracking_status === 'Order Placed' || selectedOrder.tracking_status === 'Packed') && (
                           <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                             <DialogTrigger asChild>
                               <Button variant="destructive" size="sm" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20">Cancel Order</Button>
                             </DialogTrigger>
                             <DialogContent className="glass border-white/10 text-white">
                               <DialogHeader>
                                 <DialogTitle>Cancel Order</DialogTitle>
                                 <DialogDescription className="text-muted-foreground">Please tell us why you are cancelling this order.</DialogDescription>
                               </DialogHeader>
                               <div className="space-y-4 py-4">
                                 <div className="space-y-2">
                                   <Label className="text-muted-foreground">Reason for Cancellation</Label>
                                   <Select value={cancelReason} onValueChange={setCancelReason}>
                                     <SelectTrigger className="glass border-white/10 text-white">
                                       <SelectValue placeholder="Select a reason" />
                                     </SelectTrigger>
                                     <SelectContent className="glass border-white/10 text-white">
                                       {cancellationReasons.map((reason) => (
                                         <SelectItem key={reason} value={reason} className="focus:bg-white/10 focus:text-gold cursor-pointer">{reason}</SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                 </div>
                               </div>
                               <DialogFooter>
                                 <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)} className="hover:bg-white/10 hover:text-white">Keep Order</Button>
                                 <Button variant="destructive" onClick={handleCancelOrder} disabled={cancelLoading || !cancelReason}>
                                   {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Cancellation"}
                                 </Button>
                               </DialogFooter>
                             </DialogContent>
                           </Dialog>
                         )}
                       </div>
                   </div>

                   {/* Progress (Hide if cancelled) */}
                   {selectedOrder.tracking_status !== 'Cancelled' && (
                     <div className="relative py-10 mb-12 hidden md:block px-4">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 rounded-full -translate-y-1/2" />
                        <div 
                          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-gold/50 to-gold rounded-full -translate-y-1/2 transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                          style={{ width: `${(getStatusIndex(selectedOrder.tracking_status) / (statusSteps.length - 1)) * 100}%` }}
                        />
                        <div className="relative flex justify-between">
                           {statusSteps.map((step, idx) => {
                              const currentIdx = getStatusIndex(selectedOrder.tracking_status);
                              const isCompleted = idx <= currentIdx;
                              const isCurrent = idx === currentIdx;
                              
                              return (
                                 <div key={idx} className="flex flex-col items-center gap-4 cursor-default group relative z-10 w-24">
                                    <div className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-black border-gold text-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-110' : 'bg-black border-white/10 text-muted-foreground'}`}>
                                       <step.icon className={`h-4 w-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest text-center transition-colors ${isCompleted ? 'text-gold' : 'text-muted-foreground/50'}`}>{step.label}</span>
                                 </div>
                              )
                           })}
                        </div>
                     </div>
                   )}

                   {/* Details Grid */}
                   <div className="grid md:grid-cols-2 gap-8 text-sm relative z-10">
                      <div className="glass bg-white/5 p-6 rounded-2xl border-white/5 space-y-4">
                         <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                           <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-gold" />
                           </div>
                           <h4 className="font-heading text-lg text-white">Delivery Address</h4>
                         </div>
                         
                         <div className="space-y-1">
                           <p className="font-bold text-white text-lg">{selectedOrder.customer_name}</p>
                           <p className="text-muted-foreground leading-relaxed text-sm">
                              {selectedOrder.address_json.houseAddress}
                           </p>
                           <p className="text-muted-foreground leading-relaxed text-sm">
                              {selectedOrder.address_json.landmark}
                           </p>
                           <p className="text-muted-foreground leading-relaxed text-sm">
                              {selectedOrder.address_json.place}, {selectedOrder.address_json.district}
                           </p>
                           <p className="text-muted-foreground leading-relaxed text-sm">
                              {selectedOrder.address_json.state}
                           </p>
                         </div>
                         
                         <div className="pt-4 mt-2 border-t border-white/10">
                           <p className="text-gold font-mono text-sm flex items-center gap-2 bg-gold/10 w-fit px-3 py-1.5 rounded-lg border border-gold/20">
                             <Phone className="h-3 w-3" /> {selectedOrder.customer_mobile}
                           </p>
                         </div>

                         {/* Courier Info */}
                         {selectedOrder.awb_code && (
                             <div className="mt-4 bg-black/40 p-4 rounded-xl border border-dashed border-white/20">
                               <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">Courier AWB</p>
                               <div className="flex items-center justify-between">
                                  <p className="font-mono text-white tracking-wider">{selectedOrder.awb_code}</p>
                                  <Button variant="link" size="sm" className="text-gold h-auto p-0" onClick={() => window.open(`https://shiprocket.co/tracking/${selectedOrder.awb_code}`, '_blank')}>
                                      Track Order <ArrowRight className="ml-1 h-3 w-3" />
                                  </Button>
                               </div>
                             </div>
                         )}
                      </div>

                      <div className="glass bg-white/5 p-6 rounded-2xl border-white/5 flex flex-col h-full">
                         <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                           <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gold" />
                           </div>
                           <h4 className="font-heading text-lg text-white">Order Items</h4>
                         </div>
                         
                         <div className="space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {selectedOrder.items.map((item, i) => (
                               <div key={i} className="flex gap-4 group">
                                  <div className="h-16 w-16 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-gold/30 transition-colors">
                                    {item.image && <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-center">
                                    <p className="font-medium text-white group-hover:text-gold transition-colors">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.size} <span className="text-white/20 mx-1">|</span> Qty: {item.quantity}</p>
                                  </div>
                                  <span className="font-mono text-white/80 text-sm mt-1">{formatPrice(item.price * item.quantity)}</span>
                               </div>
                            ))}
                         </div>
                         
                         <div className="pt-6 mt-auto border-t border-white/10">
                            <div className="flex justify-between items-center bg-gold/10 p-4 rounded-xl border border-gold/20">
                               <span className="text-gold uppercase text-[10px] font-bold tracking-widest">Total Amount</span>
                               <span className="text-2xl font-heading text-gold">{formatPrice(selectedOrder.total_amount)}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             ) : orders.length === 0 ? (
               <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-gold/20">
                 <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                 <h3 className="text-xl font-heading text-muted-foreground">No orders yet</h3>
                 <Button variant="link" onClick={() => navigate('/')} className="text-gold mt-2">Start Shopping</Button>
               </div>
             ) : (
               <div className="grid gap-4">
                  {orders.map((order) => (
                    <div 
                         key={order.id} 
                         onClick={async () => {
                              setSelectedOrder(order);
                              // Sync Status on Click
                              if (order.awb_code && !['Delivered', 'Cancelled'].includes(order.tracking_status)) {
                                  const updated = await orderService.syncOrderStatus(order.id, order.awb_code);
                                  if (updated) setSelectedOrder(updated);
                              }
                         }}
                         className="glass p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 group cursor-pointer border-l-4 border-l-transparent hover:border-l-gold relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       
                       <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 relative">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  order.tracking_status === 'Delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                  order.tracking_status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {order.tracking_status}
                                </span>
                                <span className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                             </div>
                             <p className="font-mono text-sm text-white/60">ID: <span className="text-white">{order.id.slice(0, 8)}</span></p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-heading text-gold">{formatPrice(order.total_amount)}</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{order.items.length} Item{order.items.length !== 1 && 's'}</p>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-3">
                         {order.items.slice(0, 4).map((item, idx) => (
                           <div key={idx} className="h-12 w-12 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-gold/30 transition-colors">
                              {item.image && <img src={item.image} className="h-full w-full object-cover" />}
                           </div>
                         ))}
                         {order.items.length > 4 && (
                           <div className="h-12 w-12 bg-white/5 rounded-lg flex items-center justify-center text-xs text-muted-foreground border border-white/10">
                              +{order.items.length - 4}
                           </div>
                         )}
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground group-hover:text-gold transition-colors flex items-center gap-2">
                            View Details <ArrowRight className="h-3 w-3" />
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </TabsContent>
          <TabsContent value="addresses" className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
               <h3 className="text-xl font-heading">Saved Addresses</h3>
               <Dialog open={isAddressOpen} onOpenChange={(open) => { setIsAddressOpen(open); if(!open) { setEditingAddress(null); resetAddressForm(); } }}>
                 <DialogTrigger asChild>
                   <Button className="bg-gold hover:bg-gold/90 text-white gap-2 rounded-full">
                     <Plus className="h-4 w-4" /> Add New
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
                   <DialogHeader>
                     <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                   </DialogHeader>
                   <form onSubmit={handleAddressSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input required value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>House No / Building</Label>
                        <Input required value={addressForm.address_line1} onChange={e => setAddressForm({...addressForm, address_line1: e.target.value})} placeholder="Flat 4B, Sky Towers" />
                      </div>
                      <div className="space-y-2">
                        <Label>Landmark</Label>
                        <Input required value={addressForm.address_line2} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} placeholder="Near Park, Opposite Bank" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>District</Label>
                          <Input required value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} placeholder="e.g. Chennai" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                          <Label>Pincode</Label>
                          <Input required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox id="is_default" checked={addressForm.is_default} onCheckedChange={(c) => setAddressForm({...addressForm, is_default: !!c})} />
                        <Label htmlFor="is_default" className="font-normal cursor-pointer">Set as default address</Label>
                      </div>

                      <DialogFooter>
                        <Button type="submit" className="bg-gold hover:bg-gold/90 text-white w-full">Save Address</Button>
                      </DialogFooter>
                   </form>
                 </DialogContent>
               </Dialog>
             </div>

             {loading ? (
               <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold" /></div>
             ) : addresses.length === 0 ? (
               <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-gold/20">
                 <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                 <p className="text-muted-foreground">No addresses saved yet.</p>
               </div>
             ) : (
               <div className="grid md:grid-cols-2 gap-4">
                 {addresses.map((addr) => (
                   <div key={addr.id} className={`p-6 rounded-2xl border transition-all hover:border-gold/50 relative group ${addr.is_default ? 'bg-gold/5 border-gold/30' : 'bg-white/5 border-white/10'}`}>
                      {addr.is_default && (
                        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded-full">Default</span>
                      )}
                      
                      <div className="pr-12">
                        <h4 className="font-bold text-lg mb-1">{addr.full_name}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {addr.address_line1}<br/>
                          {addr.address_line2 && <>{addr.address_line2}<br/></>}
                          {addr.city}, {addr.district && `${addr.district}, `}{addr.state} - {addr.pincode}<br/>
                          <span className="font-mono text-xs mt-2 block">Tel: {addr.phone}</span>
                        </p>
                      </div>

                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-gold" onClick={() => openEditAddress(addr)}>
                           <Edit2 className="h-4 w-4" />
                         </Button>
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteAddress(addr.id)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
