import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <span className="font-heading text-2xl tracking-wide">
                Puniora<sup className="text-[10px] ml-0.5">™</sup>
              </span>
              <p className="text-xs tracking-[0.2em] uppercase text-background/60 mt-1">
                Luxury in every breath
              </p>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Discover the art of fine fragrance. Each scent is a journey,
              crafted to evoke emotion and create lasting memories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg mb-4">Quick Links</h4>
            <nav className="space-y-3">
              <a href="#collection" className="block text-sm text-background/70 hover:text-gold transition-colors">
                Collection
              </a>
              <a href="#about" className="block text-sm text-background/70 hover:text-gold transition-colors">
                About Us
              </a>
              <a href="/track" className="block text-sm text-background/70 hover:text-gold transition-colors">
                Track Your Order
              </a>
              <a href="#" className="block text-sm text-background/70 hover:text-gold transition-colors">
                Shipping & Returns
              </a>
              <a href="/shipping-policy" className="block text-sm text-background/70 hover:text-gold transition-colors">
                Shipping Policy
              </a>
              <a href="/refund-policy" className="block text-sm text-background/70 hover:text-gold transition-colors">
                Refund Policy
              </a>
              <a href="/privacy-policy" className="block text-sm text-background/70 hover:text-gold transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-and-conditions" className="block text-sm text-background/70 hover:text-gold transition-colors">
                Terms & Conditions
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a
                href="tel:7010418285"
                className="flex items-start gap-3 text-sm text-background/70 hover:text-gold transition-colors"
              >
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>7010418285</span>
              </a>
              <a
                href="mailto:contact@puniora.com"
                className="flex items-start gap-3 text-sm text-background/70 hover:text-gold transition-colors"
              >
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>contact@puniora.com</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  213/9, Plot 1 Part,<br />
                  Melma Nagar Main Road,<br />
                  Mangadu, Chennai 600122
                </span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://www.instagram.com/puniorafragrance/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-background/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585786707651"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-background/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-background/50">
              Join our community and be the first to know about new releases and exclusive offers.
            </p>
          </div>
        </div>

        <Separator className="my-10 bg-background/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-background/50">
          <p>© {currentYear} Puniora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
