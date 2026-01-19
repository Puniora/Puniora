
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RotateCcw, Ban, CheckCircle } from "lucide-react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
           <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading">Refund & Cancellation Policy</h1>
             <p className="text-muted-foreground uppercase tracking-widest text-sm">Hassle-free resolutions</p>
          </div>

          <div className="space-y-12 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <RotateCcw className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">1. Returns & Exchanges</h2>
              </div>
              <p>
                Due to the nature of personal care products (fragrances), we generally <strong>do not accept returns</strong> once the product seal is broken or opened, for hygiene reasons.
              </p>
              <p>
                 However, valid Returns are accepted ONLY under the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                 <li>The product received is incorrect/different from what was ordered.</li>
                 <li>The product is physically damaged or broken upon arrival.</li>
                 <li>The product has a manufacturing defect (e.g., sprayer not working).</li>
              </ul>
              <p className="text-sm italic mt-2">
                 *You must report such issues within 48 hours of delivery with unboxing video proof.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Ban className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">2. Cancellations</h2>
              </div>
              <p>
                You can cancel your order ONLY before it has been dispatched for shipping. Once the shipment tracking number is generated, the order cannot be cancelled.
              </p>
              <p>
                 To request a cancellation, please email us at <strong>help@puniora.com</strong> or call us immediately. If approved, the refund will be processed within 5-7 business days to your original payment method.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <CheckCircle className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">3. Refunds for Damaged Items</h2>
              </div>
              <p>
                 If your return request for a damaged/wrong item is approved, we will initiate a refund or replacement.
              </p>
               <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                 <li><strong>Refunds:</strong> Will be credited to your original method of payment within 5-7 days.</li>
                 <li><strong>Replacements:</strong> Will be shipped within 2 days of approval.</li>
              </ul>
            </section>
            
             <section className="space-y-4">
              <h2 className="text-2xl font-heading text-foreground">4. Contact Us</h2>
              <p>
                For any disputes or queries, contact us:<br/>
                Email: help@puniora.com<br/>
                Phone: +91 7010418285
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
