
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gavel, Scale, AlertCircle } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading">Terms & Conditions</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm">Effective Date: January 01, 2026</p>
          </div>

          <div className="space-y-12 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Gavel className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">1. Agreement to Terms</h2>
              </div>
              <p>
                These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>Puniora</strong> ("we," "us," or "our"), concerning your access to and use of our website. By accessing the site, you confirm that you have read, understood, and agreed to be bound by all of these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Scale className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">2. Products & Services</h2>
              </div>
              <p>
                All products listed on the website are subject to availability. We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
              </p>
              <p>
                 Prices for all products are subject to change. We reserve the right to discontinue any product at any time for any reason.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-heading text-foreground">3. Purchases and Payment</h2>
              <p>
                We accept the following forms of payment: Visa, Mastercard, American Express, UPI, and Net Banking via secure gateways. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. We reserve the right to refuse any order placed through the Site.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <AlertCircle className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">4. Limitation of Liability</h2>
              </div>
              <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading text-foreground">5. Governing Law</h2>
              <p>
                These Terms shall be governed by and defined following the laws of India. Puniora and yourself irrevocably consent that the courts of Chennai, India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-heading text-foreground">6. Contact Information</h2>
              <p>
                Questions about the Terms of Service should be sent to us at <strong>help@puniora.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
