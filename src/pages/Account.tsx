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
        orderService.getOrdersByUser(user.id),
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
    } catch (error) {
      toast.error("Failed to save address");
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
      <main className="flex-1 container mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
           <div className="flex-1">
             <h1 className="text-4xl font-heading text-foreground mb-2">My Account</h1>
             <p className="text-muted-foreground">Welcome back, <span className="text-gold font-bold">{profile?.full_name || user.email}</span></p>
           </div>
           <Button variant="outline" onClick={handleLogout} className="border-destructive/20 text-destructive hover:bg-destructive/10 gap-2">
             <LogOut className="h-4 w-4" /> Logout
           </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 rounded-full border border-gold/10">
            <TabsTrigger value="orders" className="rounded-full px-6 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-lg shadow-gold/20 transition-all">
               My Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-full px-6 data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-lg shadow-gold/20 transition-all">
               Address Book
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 animate-fade-in">
             {loading ? (
               <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold" /></div>
             ) : selectedOrder ? (
               // DETAILED ORDER VIEW
                <div className="bg-white border rounded-3xl p-8 max-w-4xl mx-auto animate-slide-up">
                   <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="mb-4 -ml-2 text-muted-foreground hover:text-gold">
                      <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to My Orders
                   </Button>
                   
                   <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                           <h2 className="text-2xl font-heading">{selectedOrder.tracking_status}</h2>
                           {selectedOrder.tracking_status === 'Cancelled' && <Badge variant="destructive">Cancelled</Badge>}
                         </div>
                         <p className="text-sm text-muted-foreground">Order #{selectedOrder.id.slice(0,8)} • Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                      </div>
                       <div className="flex gap-2">
                         <Badge variant="outline" className="text-gold border-gold/20 bg-gold/5">{selectedOrder.payment_status}</Badge>
                         {(selectedOrder.tracking_status === 'Order Placed' || selectedOrder.tracking_status === 'Packed') && (
                           <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                             <DialogTrigger asChild>
                               <Button variant="destructive" size="sm">Cancel Order</Button>
                             </DialogTrigger>
                             <DialogContent>
                               <DialogHeader>
                                 <DialogTitle>Cancel Order</DialogTitle>
                                 <DialogDescription>Please tell us why you are cancelling this order.</DialogDescription>
                               </DialogHeader>
                               <div className="space-y-4 py-4">
                                 <div className="space-y-2">
                                   <Label>Reason for Cancellation</Label>
                                   <Select value={cancelReason} onValueChange={setCancelReason}>
                                     <SelectTrigger>
                                       <SelectValue placeholder="Select a reason" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       {cancellationReasons.map((reason) => (
                                         <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                 </div>
                               </div>
                               <DialogFooter>
                                 <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Keep Order</Button>
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
                     <div className="relative py-8 mb-12 hidden md:block">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2" />
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-gold rounded-full -translate-y-1/2 transition-all duration-1000"
                          style={{ width: `${(getStatusIndex(selectedOrder.tracking_status) / (statusSteps.length - 1)) * 100}%` }}
                        />
                        <div className="relative flex justify-between">
                           {statusSteps.map((step, idx) => {
                              const currentIdx = getStatusIndex(selectedOrder.tracking_status);
                              const isCompleted = idx <= currentIdx;
                              return (
                                 <div key={idx} className="flex flex-col items-center gap-2 bg-white px-2 cursor-default group">
                                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-gold border-gold text-white' : 'bg-white border-muted text-muted-foreground'}`}>
                                       <step.icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                                 </div>
                              )
                           })}
                        </div>
                     </div>
                   )}

                   {/* Details Grid */}
                   <div className="grid md:grid-cols-2 gap-12 text-sm">
                      <div>
                         <h4 className="font-bold mb-4 uppercase text-xs text-muted-foreground tracking-widest border-b pb-2">Delivery Address</h4>
                         <p className="font-medium text-lg">{selectedOrder.customer_name}</p>
                         <p className="text-muted-foreground leading-relaxed mt-1">
                            {selectedOrder.address_json.houseAddress}<br/>
                            {selectedOrder.address_json.landmark && <>{selectedOrder.address_json.landmark}<br/></>}
                            {selectedOrder.address_json.place}, {selectedOrder.address_json.district}<br/>
                            {selectedOrder.address_json.state}
                         </p>
                         <p className="mt-3 text-muted-foreground font-mono flex items-center gap-2">
                           <Phone className="h-3 w-3" /> {selectedOrder.customer_mobile}
                         </p>

                         {/* Courier Info */}
                         {selectedOrder.awb_code && (
                           <div className="mt-6 bg-muted/30 p-4 rounded-xl border border-dashed">
                             <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Courier AWB</p>
                             <p className="font-mono text-gold">{selectedOrder.awb_code}</p>
                           </div>
                         )}
                      </div>

                      <div>
                         <h4 className="font-bold mb-4 uppercase text-xs text-muted-foreground tracking-widest border-b pb-2">Order Items</h4>
                         <div className="space-y-4">
                            {selectedOrder.items.map((item, i) => (
                               <div key={i} className="flex gap-4">
                                  <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0 border">
                                    {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.size} x {item.quantity}</p>
                                  </div>
                                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                               </div>
                            ))}
                            <div className="pt-4 mt-4 border-t flex justify-between items-center">
                               <span className="text-muted-foreground uppercase text-xs font-bold">Total Amount</span>
                               <span className="text-xl font-heading text-gold">{formatPrice(selectedOrder.total_amount)}</span>
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
                   <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer hover:border-gold/50">
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-dashed pb-4">
                         <div>
                           <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Order ID</p>
                           <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                         </div>
                         <div>
                           <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Date</p>
                           <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                         </div>
                         <div>
                           <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Total</p>
                           <p className="font-bold text-gold">{formatPrice(order.total_amount)}</p>
                         </div>
                         <div className="flex items-center gap-4">
                           <div>
                             <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Status</p>
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                               order.tracking_status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                               order.tracking_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                               'bg-blue-100 text-blue-800'
                             }`}>
                               {order.tracking_status}
                             </span>
                           </div>
                           <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors" />
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                             <div className="h-10 w-10 bg-muted/50 rounded-lg overflow-hidden shrink-0 border">
                               {item.image && <img src={item.image} className="h-full w-full object-cover" />}
                             </div>
                             <div className="flex-1">
                               <p className="text-sm font-semibold">{item.name}</p>
                               <p className="text-[10px] text-muted-foreground">{item.size} x {item.quantity}</p>
                             </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-muted-foreground pl-14">+ {order.items.length - 2} more items</p>
                        )}
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
                        <Label>Road / Area</Label>
                        <Input required value={addressForm.address_line2} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} placeholder="MG Road, Indiranagar" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                        </div>
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
                   <div key={addr.id} className={`p-6 rounded-2xl border transition-all hover:border-gold/50 relative group ${addr.is_default ? 'bg-gold/5 border-gold/30' : 'bg-white'}`}>
                      {addr.is_default && (
                        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded-full">Default</span>
                      )}
                      
                      <div className="pr-12">
                        <h4 className="font-bold text-lg mb-1">{addr.full_name}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {addr.address_line1}<br/>
                          {addr.address_line2 && <>{addr.address_line2}<br/></>}
                          {addr.city}, {addr.state} - {addr.pincode}<br/>
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
