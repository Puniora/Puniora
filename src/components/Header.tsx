import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchDialog from "./SearchDialog";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import { settingsService } from "@/lib/services/settingsService";
import AnnouncementBanner from "./AnnouncementBanner";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Banner State
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerText, setBannerText] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const enabled = await settingsService.getJsonSetting<boolean>("banner_enabled", false);
      const text = await settingsService.getSetting("banner_text");
      setBannerEnabled(enabled);
      setBannerText(text || "");
    };
    fetchSettings();
  }, [location.pathname]); // Re-check on nav change potentially, or just mount

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On non-home pages, we want the "scrolled" style (dark text) by default unless actual scrolling happens
  const isTransparent = isHome && !isScrolled;

  const navLinks = [
    { label: "Collection", href: "/#collection" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
    { label: "Blog", href: "/blog" },
    { label: "Policies", href: "/privacy-policy" },
  ];

  return (
    <>
    <AnnouncementBanner enabled={bannerEnabled} text={bannerText} />
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 top-0 ${bannerEnabled && bannerText ? 'mt-8' : 'mt-0'} ${!isTransparent
    // Note: If banner is enabled, we push header down. 
    // BUT if we are at top of page (isTransparent true), does it still look right?
    // If banner is present, it pushes page content down (it is relative). 
    // Header is fixed. 
    // If Header has mt-8, it moves down 32px.
    // Perfect.
        ? "glass shadow-sm py-2"
        : "bg-transparent py-4"
        } ${isHome ? 'mt-0' : ''}`} 
        // Note: The margin-top logic might need adjustment depending on how the banner is positioned (sticky vs fixed).
        // If banner is simply rendered above header, header needs to be relative or sticky. 
        // Actually, if Header is fixed, Banner should also be fixed or push it down. 
        // Let's make Banner FIXED at top, and push Header down?
        // Or put Banner INSIDE header but at top? 
        // User said "above navbar". 
        // If Header is fixed, putting Banner above it means Banner covers top content OR Banner is also fixed.
        // Let's put Banner INSIDE the Fragment, and if it renders, it pushes content down? 
        // But Header is `fixed top-0`. 
        // Strategy: Make Banner `fixed top-0 z-[60]` and Header `fixed top-[bannerHeight]`.
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex flex-col items-start group">
            <span className={`font-heading text-2xl md:text-3xl tracking-wide transition-colors duration-300 ${!isTransparent ? 'text-foreground' : 'text-white'} group-hover:text-gold`}>
              Puniora
              <sup className="text-[10px] ml-0.5">™</sup>
            </span>
            <span className={`text-[8px] md:text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 -mt-1 group-hover:tracking-[0.4em] ${!isTransparent ? 'text-muted-foreground' : 'text-white/70'}`}>
              Luxury in every breath
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative group ${!isTransparent ? 'text-foreground/80' : 'text-white/90'} hover:text-gold`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className={`hover:text-gold transition-colors ${!isTransparent ? 'text-foreground' : 'text-white'}`}
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-7 w-7" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`relative hover:text-gold transition-colors ${!isTransparent ? 'text-foreground' : 'text-white'}`}
              onClick={openCart}
            >
              <ShoppingBag className="h-7 w-7" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

            
            <Link to={user ? "/account" : "/auth"}>
              <Button
                variant="ghost"
                size="icon"
                className={`hidden md:inline-flex hover:text-gold transition-colors ${!isTransparent ? 'text-foreground' : 'text-white'}`}
              >
                <User className="h-7 w-7" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden hover:text-gold transition-colors ${!isTransparent ? 'text-foreground' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-8 w-8" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/98 backdrop-blur-xl z-[60] md:hidden animate-fade-in flex flex-col">
          <div className="container mx-auto px-6 py-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-16">
              <span className="font-heading text-2xl tracking-wide">
                Puniora<sup className="text-[10px] ml-0.5">™</sup>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:rotate-90 transition-transform duration-300"
              >
                <X className="h-8 w-8 text-gold" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-8 flex-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-4xl font-heading tracking-widest text-foreground hover:text-gold transition-all duration-300 group flex items-center gap-4"
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-xs font-sans text-gold opacity-50">0{i + 1}</span>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto py-8 border-t border-border">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Admin Access</p>
              <a href="/admin-login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="luxuryOutline" className="w-full justify-between group">
                  Admin Panel
                  <User className="h-4 w-4 group-hover:text-gold" />
                </Button>
              </a>
              <Link to={user ? "/account" : "/auth"} onClick={() => setIsMobileMenuOpen(false)} className="mt-4 block">
                 <Button variant="luxuryOutline" className="w-full justify-between group">
                   {user ? "My Account" : "User Login"}
                   <User className="h-4 w-4 group-hover:text-gold" />
                 </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
    </>
  );
};

export default Header;
