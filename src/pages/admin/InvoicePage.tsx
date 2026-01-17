import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderService, Order } from '@/lib/services/orderService';
import { formatPrice } from '@/lib/products';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InvoicePage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        // We reuse getOrders but we really need getOrderById. 
        // Since getOrderById might not exist, we can fetch all and find (not efficient but works for now) 
        // OR better, assuming there is a getOrderById or we implement one.
        // Let's assume we need to implement getOrderById or just use getOrders().
        // Actually, looking at orderService in previous turns, it didn't seem to have getById.
        // Let's try to fetch all and filter for now to be safe, or check orderService.
        const orders = await orderService.getOrders();
        const found = orders.find(o => o.id === orderId);
        setOrder(found || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  if (!order) return <div className="flex h-screen items-center justify-center">Order not found</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-12 font-sans">
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} className="bg-gold text-white hover:bg-gold/90 gap-2 shadow-lg">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* A4 Invoice Layout */}
      <div className="max-w-[210mm] mx-auto bg-white print:max-w-none">
        {/* Header */}
        <header className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-heading tracking-widest text-gold uppercase">Puniora</h1>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Luxury Fragrance Hub</p>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900">Invoice</h2>
            <p className="text-sm font-mono text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-12">
           {/* From */}
           <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">From</h3>
              <div className="text-sm leading-relaxed">
                 <p className="font-bold text-lg mb-1">Puniora Inc.</p>
                 <p>Luxury Fragrance Hub</p>
                 <p>Kerala, India</p>
                 <p>support@puniora.com</p>
              </div>
           </div>

           {/* To */}
           <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Bill To</h3>
              <div className="text-sm leading-relaxed">
                 <p className="font-bold text-lg mb-1">{order.customer_name}</p>
                 <p>{order.address_json.houseAddress}</p>
                 <p>{order.address_json.place}, {order.address_json.district}</p>
                 <p>{order.address_json.state}</p>
                 <p className="mt-2 text-gray-600">Tel: {order.customer_mobile}</p>
              </div>
           </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-600 w-[50%]">Item Description</th>
                <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-600 text-center">Qty</th>
                <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-600 text-right">Price</th>
                <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-600 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 pr-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.size && <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Size: {item.size}</p>}
                  </td>
                  <td className="py-4 text-center font-medium">{item.quantity}</td>
                  <td className="py-4 text-right font-medium text-gray-600">{formatPrice(item.price)}</td>
                  <td className="py-4 text-right font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Analysis */}
        <div className="flex justify-end mb-16">
           <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Subtotal</span>
                 <span className="font-medium">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Shipping</span>
                 <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-4 mt-4">
                 <span>Total</span>
                 <span>{formatPrice(order.total_amount)}</span>
              </div>
           </div>
        </div>

        {/* Payment & Footer */}
        <div className="border-t border-gray-100 pt-8 grid grid-cols-2 gap-8">
           <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Payment Details</h4>
              <p className="text-sm font-medium capitalize">{order.payment_status} via Razorpay</p>
              {order.razorpay_payment_id && <p className="text-xs font-mono text-gray-500">{order.razorpay_payment_id}</p>}
           </div>
           <div className="text-right space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Thank You</h4>
              <p className="text-sm text-gray-500 italic">"Luxury in every breath"</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;
