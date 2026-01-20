import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Track Order", href: "/track" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <>
      <AnnouncementBanner enabled={bannerEnabled} text={bannerText} />
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-700 top-0 px-4 md:px-0 ${bannerEnabled && bannerText ? 'mt-8' : 'mt-0'} ${!isTransparent
          ? "glass shadow-[0_4px_20px_-5px_rgba(212,175,55,0.1)] py-3 mt-4 mx-4 md:mx-8 rounded-full border-white/40"
          : "bg-transparent py-6"
          } ${isHome ? '' : ''}`}
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
              <span className={`font-heading text-2xl md:text-3xl tracking-wide transition-colors duration-300 ${!isTransparent ? 'text-bronze-dark' : 'text-bronze-dark'} group-hover:text-gold`}>
                Puniora
                <sup className="text-[10px] ml-0.5">™</sup>
              </span>
              <span className={`text-[8px] md:text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 -mt-1 group-hover:tracking-[0.4em] ${!isTransparent ? 'text-bronze/60' : 'text-bronze/80'}`}>
                Luxury in every breath
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative group ${!isTransparent ? 'text-bronze-dark' : 'text-bronze-dark'} hover:text-gold`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}

              {/* Policy Pages Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative group flex items-center gap-1 ${!isTransparent ? 'text-bronze-dark' : 'text-bronze-dark'} hover:text-gold outline-none`}>
                  Policies
                  <ChevronDown className="h-3 w-3" />
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full"></span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gold/20 shadow-xl">
                  <DropdownMenuItem asChild>
                    <Link to="/privacy-policy" className="cursor-pointer text-xs uppercase tracking-wider">
                      Privacy Policy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/shipping-policy" className="cursor-pointer text-xs uppercase tracking-wider">
                      Shipping Policy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/refund-policy" className="cursor-pointer text-xs uppercase tracking-wider">
                      Refund & Return
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className={`hover:text-gold transition-colors ${!isTransparent ? 'text-bronze-dark' : 'text-bronze-dark'}`}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-7 w-7" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`relative hover:text-gold transition-colors ${!isTransparent ? 'text-bronze-dark' : 'text-bronze-dark'}`}
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
                  className={`hidden md:inline-flex hover:text-gold transition-colors ${!isTransparent ? 'text-bronze-dark' : 'text-bronze-dark'}`}
                >
                  <User className="h-7 w-7" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden hover:text-gold transition-colors ${!isTransparent ? 'text-bronze-dark' : 'text-bronze-dark'}`}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[60] md:hidden animate-fade-in flex flex-col">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-gold/5 to-gold/10 pointer-events-none" />

            <div className="container mx-auto px-6 py-8 flex flex-col h-full relative z-10">
              <div className="flex justify-between items-center mb-12">
                <span className="font-heading text-2xl tracking-wide">
                  Puniora<sup className="text-[10px] ml-0.5">™</sup>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:rotate-90 transition-transform duration-500 hover:text-gold"
                >
                  <X className="h-8 w-8" />
                </Button>
              </div>

              <nav className="flex flex-col space-y-6 flex-1 justify-center">
                {navLinks.map((link, i) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-4xl md:text-5xl font-heading tracking-widest text-foreground hover:text-transparent hover:bg-clip-text hover:bg-gradient-gold transition-all duration-500 group flex items-baseline gap-4 animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xs font-sans text-gold opacity-50 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                    {link.label}
                  </a>
                ))}

                {/* Policy Pages Submenu */}
                <div className="pt-4 border-t border-white/10 space-y-4 animate-fade-in-up" style={{ animationDelay: `${navLinks.length * 100}ms` }}>
                  <p className="text-xs uppercase tracking-widest text-gold/60 font-bold">Policies</p>
                  <Link
                    to="/privacy-policy"
                    className="text-xl font-heading text-foreground/80 hover:text-gold transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/shipping-policy"
                    className="text-xl font-heading text-foreground/80 hover:text-gold transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shipping Policy
                  </Link>
                  <Link
                    to="/refund-policy"
                    className="text-xl font-heading text-foreground/80 hover:text-gold transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Refund & Return
                  </Link>
                </div>
              </nav>

              <div className="mt-auto pt-8 border-t border-white/10 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="grid grid-cols-2 gap-4">
                  <a href="/admin-login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="luxuryOutline" className="w-full justify-between group h-12 border-white/20 hover:border-gold hover:bg-gold/10">
                      Admin
                      <User className="h-4 w-4 group-hover:text-gold" />
                    </Button>
                  </a>
                  <Link to={user ? "/account" : "/auth"} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="luxuryOutline" className="w-full justify-between group h-12 border-white/20 hover:border-gold hover:bg-gold/10">
                      {user ? "Account" : "Login"}
                      <User className="h-4 w-4 group-hover:text-gold" />
                    </Button>
                  </Link>
                </div>
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
