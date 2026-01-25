import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-[#020202] text-white border-t border-white/5 relative overflow-hidden">
      {/* Footer Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <span className="font-heading text-4xl tracking-wide text-white">
                Puniora<sup className="text-sm ml-1 text-gold">™</sup>
              </span>
              <div className="h-0.5 w-12 bg-gold mt-4 mb-4" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">
                Luxury in every breath
              </p>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs font-light">
              Discover the art of fine fragrance. Each scent is a journey,
              crafted to evoke emotion and create lasting memories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl mb-8 text-gold">Collection</h4>
            <nav className="space-y-4">
              {[
                { label: "Collection", href: "#collection" },
                { label: "About Us", href: "#about" },
                { label: "Track Order", href: "/track" },
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Refund Policy", href: "/refund-policy" }
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/60 hover:text-gold hover:translate-x-2 transition-all duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-xl mb-8 text-gold">Contact</h4>
            <div className="space-y-6">
              <a
                href="tel:7010418285"
                className="flex items-start gap-4 text-sm text-white/60 hover:text-gold transition-colors group"
              >
                <div className="p-2 border border-white/10 rounded-full group-hover:border-gold/50 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="mt-1.5">7010418285</span>
              </a>
              <a
                href="mailto:contact@puniora.com"
                className="flex items-start gap-4 text-sm text-white/60 hover:text-gold transition-colors group"
              >
                <div className="p-2 border border-white/10 rounded-full group-hover:border-gold/50 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="mt-1.5">contact@puniora.com</span>
              </a>
              <div className="flex items-start gap-4 text-sm text-white/60 group">
                <div className="p-2 border border-white/10 rounded-full group-hover:border-gold/50 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="mt-1.5 leading-relaxed">
                  213/9, Melma Nagar main road Mangadu,<br />
                  Chennai, Tamilnadu 600122<br />
                  <span className="text-gold/80">GST: 33AGNPI3783K2ZZ</span>
                </span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading text-xl mb-8 text-gold">Follow Us</h4>
            <div className="flex gap-4 mb-8">
              {[
                { icon: Instagram, href: "https://www.instagram.com/puniorafragrance/", label: "Instagram" },
                { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61585786707651", label: "Facebook" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-gold hover:text-black hover:border-gold hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-white/30 leading-relaxed">
              Join our community and be the first to know about new releases.
            </p>
          </div>
        </div>

        <Separator className="my-16 bg-white/5" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/30">
          <p>© {currentYear} Puniora. Luxury in every breath.</p>
          <div className="flex gap-8">
            <a href="/privacy-policy" className="hover:text-gold transition-colors">Privacy</a>
            <a href="/terms-and-conditions" className="hover:text-gold transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
