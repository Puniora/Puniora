
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading">Privacy Policy</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm">Last Updated: January 2026</p>
          </div>

          <div className="space-y-12 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Shield className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">1. Introduction</h2>
              </div>
              <p>
                Welcome to Puniora ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website <strong>puniora.com</strong> in compliance with the Information Technology Act, 2000 and other applicable Indian laws.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Eye className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">2. Information We Collect</h2>
              </div>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping/billing address when you place an order.</li>
                <li><strong>Payment Information:</strong> We do NOT store your credit card or sensitive payment details. All transactions are processed through secure payment gateways (like Razorpay) compliant with PCI-DSS standards.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and browsing behavior on our site to improve user experience.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <FileText className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">3. How We Use Your Information</h2>
              </div>
              <p>Your data is used strictly for:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                <li>Processing and delivering your orders.</li>
                <li> sending you order updates, invoices, and shipping notifications.</li>
                <li>Improving our website, products, and customer service.</li>
                <li>Complying with legal obligations and fraud prevention.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Lock className="h-6 w-6 text-gold" />
                 <h2 className="text-2xl font-heading text-foreground">4. Data Security</h2>
              </div>
              <p>
                We implement robust security measures to protect your personal information. Our website uses SSL encryption (HTTPS) to ensure data transmitted between your browser and our servers is secure. access to your personal data is restricted to authorized personnel only.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-heading text-foreground">5. Third-Party Services</h2>
              <p>
                We may share minimal data with trusted third parties solely for operational purposes, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                <li><strong>Logistics Partners:</strong> To deliver your package (e.g., Shiprocket, Delhivery).</li>
                <li><strong>Payment Processors:</strong> To verify and process payments (e.g., Razorpay).</li>
              </ul>
              <p>We do NOT sell, trade, or rent your personal identification information to others.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-heading text-foreground">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:<br/>
                <strong>Email:</strong> help@puniora.com<br/>
                <strong>Phone:</strong> +91 7010418285
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
