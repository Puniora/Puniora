import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderService, OrderItem, Address } from "@/lib/services/orderService";
import { productService } from "@/lib/services/productService";
import { Product, formatPrice } from "@/lib/products";
import { Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const NewOrderForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    // Form state
    const [customerName, setCustomerName] = useState("");
    const [customerMobile, setCustomerMobile] = useState("");
    const [address, setAddress] = useState<Address>({
        state: "",
        district: "",
        place: "",
        houseAddress: "",
        landmark: ""
    });
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'failed'>('pending');

    useEffect(() => {
        if (open) {
            fetchProducts();
        }
    }, [open]);

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data.filter(p => !p.isHidden));
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products");
        }
    };

    const addItem = () => {
        if (products.length === 0) return;
        setSelectedItems([...selectedItems, {
            id: products[0].id,
            name: products[0].name,
            price: products[0].price,
            quantity: 1,
            image: products[0].images[0],
            size: products[0].size
        }]);
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const updated = [...selectedItems];
        if (field === 'id') {
            // When product changes, update all related fields
            const product = products.find(p => p.id === value);
            if (product) {
                updated[index] = {
                    ...updated[index],
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    size: product.size
                };
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setSelectedItems(updated);
    };

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!customerName.trim()) {
            toast.error("Customer name is required");
            return;
        }
        if (!customerMobile.trim()) {
            toast.error("Customer mobile is required");
            return;
        }
        if (selectedItems.length === 0) {
            toast.error("Add at least one product");
            return;
        }
        if (!address.state || !address.district || !address.houseAddress) {
            toast.error("Please fill in all required address fields");
            return;
        }

        setLoading(true);
        try {
            await orderService.createOrder({
                customer_name: customerName,
                customer_mobile: customerMobile,
                address_json: address,
                items: selectedItems,
                total_amount: calculateTotal(),
                payment_status: paymentStatus
            });

            toast.success("Order created successfully!");

            // Reset form
            setCustomerName("");
            setCustomerMobile("");
            setAddress({
                state: "",
                district: "",
                place: "",
                houseAddress: "",
                landmark: ""
            });
            setSelectedItems([]);
            setPaymentStatus('pending');
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error("Failed to create order:", error);
            toast.error("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gold hover:bg-gold/90 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Create Order
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading">Create New Order</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Customer Information */}
                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gold">Customer Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer Name *</Label>
                                <Input
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Mobile Number *</Label>
                                <Input
                                    required
                                    value={customerMobile}
                                    onChange={(e) => setCustomerMobile(e.target.value)}
                                    placeholder="9876543210"
                                    type="tel"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gold">Shipping Address</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>State *</Label>
                                <Input
                                    required
                                    value={address.state}
                                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                    placeholder="Maharashtra"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>District *</Label>
                                <Input
                                    required
                                    value={address.district}
                                    onChange={(e) => setAddress({ ...address, district: e.target.value })}
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Place/City</Label>
                                <Input
                                    value={address.place}
                                    onChange={(e) => setAddress({ ...address, place: e.target.value })}
                                    placeholder="Andheri"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Landmark</Label>
                                <Input
                                    value={address.landmark}
                                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                    placeholder="Near Metro Station"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>House Address *</Label>
                                <Input
                                    required
                                    value={address.houseAddress}
                                    onChange={(e) => setAddress({ ...address, houseAddress: e.target.value })}
                                    placeholder="Flat 101, Building A, Street Name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-gold">Order Items</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                                <Plus className="h-3 w-3" />
                                Add Product
                            </Button>
                        </div>

                        {selectedItems.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground italic text-sm">
                                No products added yet. Click "Add Product" to start.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedItems.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-start bg-background p-3 rounded-lg border border-border">
                                        <div className="flex-1 grid md:grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Product</Label>
                                                <Select
                                                    value={item.id}
                                                    onValueChange={(value) => updateItem(index, 'id', value)}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map((product) => (
                                                            <SelectItem key={product.id} value={product.id}>
                                                                {product.name} - {formatPrice(product.price)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Quantity</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Subtotal</Label>
                                                <div className="h-9 flex items-center font-bold text-gold">
                                                    {formatPrice(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="h-9 w-9 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Separator />

                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-heading text-lg">Total Amount</span>
                                    <span className="font-heading text-2xl text-gold">{formatPrice(calculateTotal())}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gold">Payment Status</h3>
                        <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold/90 text-white min-w-[150px]">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Create Order
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NewOrderForm;
