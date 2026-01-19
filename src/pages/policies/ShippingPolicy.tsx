
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Truck, Clock, Map } from "lucide-react";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
           <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading">Shipping Policy</h1>
             <p className="text-muted-foreground uppercase tracking-widest text-sm">Fast, Safe, and Reliable Delivery</p>
          </div>

          <div className="space-y-12 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Clock className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">1. Processing Time</h2>
              </div>
              <p>
                All orders are processed within <strong>1-2 business days</strong>. Orders are not shipped or delivered on Sundays or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Truck className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">2. Shipping Rates & Delivery Estimates</h2>
              </div>
              <p>
                We offer free standard shipping on all prepaid orders across India.
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gold pt-2">
                 <li><strong>Standard Shipping:</strong> 3-7 Business Days (Free)</li>
                 <li><strong>Express Shipping:</strong> 2-4 Business Days (Additional charges may apply if available at checkout)</li>
              </ul>
              <p className="text-sm italic text-muted-foreground pt-2">
                 *Delivery delays can occasionally occur due to unforeseen courier issues.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Map className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">3. Shipment Tracking</h2>
              </div>
              <p>
                You will receive a Shipment Confirmation email/SMS once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours. You can track your order directly on our "Track Order" page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading text-foreground">4. Damages</h2>
              <p>
                Puniora is not liable for any fragrance bottles damaged or lost during shipping. However, if you received your order damaged, please document the damage (photos/video) and contact us immediately at <strong>help@puniora.com</strong> so we can raise a dispute with the courier and assist you.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
