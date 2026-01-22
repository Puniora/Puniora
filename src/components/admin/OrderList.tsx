import { useState, useEffect } from "react";
import { orderService, Order } from "@/lib/services/orderService";
import { formatPrice } from "@/lib/products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, MapPin, Phone, User, Package, Trash2, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

const OrderList = ({ orders, loading, onRefresh }: OrderListProps) => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    if (statusFilter !== "all" && order.tracking_status !== statusFilter) {
      return false;
    }

    // 2. Date Filter
    if (dateFilter) {
      const orderDate = new Date(order.created_at);
      // Compare year, month, day
      if (
        orderDate.getFullYear() !== dateFilter.getFullYear() ||
        orderDate.getMonth() !== dateFilter.getMonth() ||
        orderDate.getDate() !== dateFilter.getDate()
      ) {
        return false;
      }
    }

    return true;
  });

  const handleUpdateTracking = async (orderId: string, status: Order['tracking_status'], trackingId?: string) => {
    try {
      setUpdating(orderId);
      await orderService.updateTracking(orderId, status, trackingId);
      toast.success("Tracking updated successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update tracking");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This cannot be undone.")) return;
    try {
      await orderService.deleteOrder(orderId);
      toast.success("Order deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground italic border border-dashed rounded-xl border-border/50 bg-muted/20">
        No orders found yet.
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4">

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground whitespace-nowrap">Filter by Date:</Label>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] h-9 justify-start text-left font-normal text-xs uppercase tracking-wider border-border/50",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {dateFilter && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDateFilter(undefined)}
                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
                title="Clear Date Filter"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground whitespace-nowrap">Filter by Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs font-medium uppercase tracking-wider bg-background border-border/50">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="Order Placed">Order Placed</SelectItem>
              <SelectItem value="Packed">Packed</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Date</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Customer</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Items</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Amount</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Tracking</TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
            <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id} className="group border-border/50 hover:bg-muted/30 transition-colors">
              <TableCell className="text-sm">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">{order.customer_name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{order.customer_mobile}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </TableCell>
              <TableCell className="font-bold text-gold">
                {formatPrice(order.total_amount)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="uppercase text-[9px] tracking-[0.2em] font-bold px-2.5 py-0.5 rounded-full bg-gold/5 text-gold border-gold/20"
                >
                  {order.tracking_status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gold/10 hover:text-gold transition-colors">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl glass border-white/10 rounded-3xl p-0 overflow-hidden max-h-[95vh] flex flex-col text-white">
                      <DialogHeader className="p-8 pb-4 border-b border-white/10">
                        <DialogTitle className="font-heading text-3xl text-gradient-orange">Order Details</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                        <div className="grid md:grid-cols-3 gap-10">
                          <div className="md:col-span-2 space-y-8">
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                className="gap-2 border-puniora-orange-500/20 text-puniora-orange-500 hover:bg-puniora-orange-500 hover:text-white transition-all duration-300"
                                onClick={() => window.open(`/admin/invoice/${order.id}`, '_blank')}
                              >
                                <Printer className="h-4 w-4" /> Print / Download Invoice
                              </Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                              <section className="space-y-3">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                                  <User className="h-3 w-3" /> Customer Info
                                </h4>
                                <div className="glass-card p-4 rounded-2xl">
                                  <p className="font-bold text-lg text-white">{order.customer_name}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Phone className="h-3.5 w-3.5" /> {order.customer_mobile}
                                  </p>
                                </div>
                              </section>

                              <section className="space-y-3">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5" /> Shipping Address
                                </h4>
                                <div className="glass-card p-4 rounded-2xl text-sm leading-relaxed italic text-white/90">
                                  <p>{order.address_json.houseAddress}</p>
                                  <p>{order.address_json.place}, {order.address_json.district}</p>
                                  <p>{order.address_json.state}</p>
                                  {order.address_json.landmark && (
                                    <p className="mt-2 text-xs text-puniora-orange-400 font-medium">Near: {order.address_json.landmark}</p>
                                  )}
                                </div>
                              </section>
                            </div>

                            <section className="space-y-4 pt-4 border-t border-white/10">
                              <h4 className="text-[10px] uppercase tracking-widest font-bold text-puniora-orange-500 flex items-center gap-2">
                                <Package className="h-3.5 w-3.5" /> Order Tracking Update
                              </h4>
                              
                              {order.tracking_status === 'Cancelled' && order.cancellation_reason && (
                                <div className="bg-red-950/30 p-4 rounded-xl border border-red-500/20 mb-4">
                                  <p className="text-[10px] uppercase tracking-widest font-bold text-red-400 mb-1">Cancellation Reason</p>
                                  <p className="font-medium text-red-200">{order.cancellation_reason}</p>
                                </div>
                              )}

                              <div className="grid md:grid-cols-2 gap-6 items-end glass-card p-6 rounded-2xl bg-puniora-orange-500/5">
                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase tracking-widest font-bold opacity-70">Order Status</Label>
                                  <Select
                                    defaultValue={order.tracking_status}
                                    onValueChange={(val) => handleUpdateTracking(order.id, val as Order['tracking_status'], order.tracking_id)}
                                    disabled={updating === order.id}
                                  >
                                    <SelectTrigger className="h-11 rounded-xl bg-black/40 border-white/10 text-white focus:ring-puniora-orange-500/20">
                                      <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 border-white/10 text-white">
                                      <SelectItem value="Order Placed">Order Placed</SelectItem>
                                      <SelectItem value="Packed">Packed</SelectItem>
                                      <SelectItem value="Shipped">Shipped</SelectItem>
                                      <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                      <SelectItem value="Delivered">Delivered</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase tracking-widest font-bold opacity-70">Tracking ID / Courier ID</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      defaultValue={order.tracking_id}
                                      placeholder="AWB / Shipping ID"
                                      className="h-11 rounded-xl bg-black/40 border-white/10 text-white focus:ring-puniora-orange-500/20 italic placeholder:text-white/20"
                                      onBlur={(e) => handleUpdateTracking(order.id, order.tracking_status, e.target.value)}
                                      disabled={updating === order.id}
                                    />
                                  </div>
                                </div>
                              </div>
                            </section>

                            <section className="space-y-3">
                              <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Order Items</h4>
                              <div className="glass-card p-6 rounded-2xl space-y-4 h-full max-h-[200px] overflow-auto custom-scrollbar">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex gap-4">
                                      <div className="h-12 w-12 bg-white/5 rounded-lg p-1 border border-white/10 shrink-0">
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        ) : (
                                          <div className="w-full h-full bg-white/5 rounded-md" />
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-white">{item.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                          {item.size ? `${item.size} • ` : ''}
                                          {item.note ? `Note: ${item.note} • ` : ''}
                                          Qty: {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="font-medium text-puniora-orange-400">{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                                <Separator className="bg-white/10" />
                                <div className="flex justify-between items-center pt-2">
                                  <span className="font-heading text-xl text-white">Total</span>
                                  <span className="font-heading text-2xl text-puniora-orange-500 text-glow">{formatPrice(order.total_amount)}</span>
                                </div>
                              </div>
                            </section>
                          </div>

                          <div className="space-y-6">
                            <div className="glass-card p-6 rounded-2xl space-y-6">
                              <div className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Payment Status</h4>
                                <div className="flex flex-col gap-2">
                                  <Badge
                                    variant={order.payment_status === 'paid' ? 'default' : order.payment_status === 'failed' ? 'destructive' : 'secondary'}
                                    className={`uppercase text-[9px] tracking-[0.2em] font-bold px-3 py-1 rounded-full w-fit ${order.payment_status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                      order.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''
                                      }`}
                                  >
                                    {order.payment_status}
                                  </Badge>
                                  {order.razorpay_payment_id && (
                                    <div className="mt-2 flex flex-col gap-1">
                                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Payment ID</span>
                                      <span className="text-[10px] font-mono break-all bg-black/40 p-2 rounded-xl text-white/80 border border-white/5">{order.razorpay_payment_id}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Separator className="bg-white/10" />

                              <div className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Order ID</h4>
                                <span className="text-[10px] font-mono break-all bg-black/40 p-2 rounded-xl block text-white/80 border border-white/5">{order.id}</span>
                              </div>

                              <div className="pt-2">
                                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Tracking History</div>
                                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                                  {['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((status) => {
                                    const isDone = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(order.tracking_status) >= ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(status);
                                    return (
                                      <div key={status} className="flex items-center gap-4 relative pl-8">
                                        <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 transition-all duration-300 ${isDone ? 'bg-puniora-orange-500 border-puniora-orange-500 shadow-[0_0_10px_rgba(247,107,28,0.5)]' : 'bg-transparent border-white/20'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isDone ? 'text-white' : 'text-muted-foreground opacity-50'}`}>{status}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderList;
