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
    { label: "Blog", href: "/blog" },
  ];

  return (
    <>
      <AnnouncementBanner enabled={bannerEnabled} text={bannerText} />
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] top-0 px-4 md:px-0 ${bannerEnabled && bannerText ? 'mt-8' : 'mt-0'} 
        ${!isTransparent || isMobileMenuOpen
          ? "py-3 mt-4 mx-4 md:mx-8 border-orange-500/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3)]"
          : "bg-transparent py-6"
        } 
        ${isMobileMenuOpen 
          ? "bg-black/95 backdrop-blur-3xl rounded-[32px] border border-white/10" 
          : (!isTransparent ? "glass rounded-[32px]" : "bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-8 pb-12")
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex flex-col items-start group drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              <span className={`font-heading text-2xl md:text-3xl tracking-wide transition-colors duration-300 ${!isTransparent || isMobileMenuOpen ? 'text-white' : 'text-white'} group-hover:text-gold`}>
                Puniora
                <sup className="text-[10px] ml-0.5">™</sup>
              </span>
              <span className={`text-[8px] md:text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 -mt-1 group-hover:tracking-[0.4em] ${!isTransparent || isMobileMenuOpen ? 'text-white/60' : 'text-white/90 font-medium'}`}>
                Luxury in every breath
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative group drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${!isTransparent ? 'text-white' : 'text-white'} hover:text-gold`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full box-shadow-[0_0_8px_rgba(247,107,28,0.8)]"></span>
                </a>
              ))}

              {/* Policy Pages Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative group flex items-center gap-1 ${!isTransparent ? 'text-white' : 'text-white'} hover:text-gold outline-none`}>
                  Policies
                  <ChevronDown className="h-3 w-3" />
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full"></span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl text-white">
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-gold cursor-pointer">
                    <Link to="/privacy-policy" className="text-xs uppercase tracking-wider block w-full">
                      Privacy Policy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-gold cursor-pointer">
                    <Link to="/shipping-policy" className="text-xs uppercase tracking-wider block w-full">
                      Shipping Policy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-gold cursor-pointer">
                    <Link to="/refund-policy" className="text-xs uppercase tracking-wider block w-full">
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
                className={`hover:text-gold hover:bg-transparent transition-colors ${!isTransparent || isMobileMenuOpen ? 'text-white' : 'text-white'}`}
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-7 w-7" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`relative hover:text-gold hover:bg-transparent transition-colors ${!isTransparent || isMobileMenuOpen ? 'text-white' : 'text-white'}`}
                onClick={openCart}
                aria-label="Open Cart"
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
                  className={`hover:text-gold hover:bg-transparent transition-colors ${!isTransparent || isMobileMenuOpen ? 'text-white' : 'text-white'}`}
                  aria-label="User Account"
                >
                  <User className="h-7 w-7" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden hover:text-gold hover:bg-transparent transition-colors ${!isTransparent || isMobileMenuOpen ? 'text-white' : 'text-white'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                <div className="relative h-8 w-8 flex items-center justify-center">
                  <X 
                     className={`absolute h-8 w-8 transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} 
                  />
                  <Menu 
                     className={`absolute h-8 w-8 transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} 
                  />
                </div>
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Content - Nested inside Header */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
              isMobileMenuOpen ? "max-h-[85vh] opacity-100 mt-4 pb-8" : "max-h-0 opacity-0 mt-0 pb-0"
            }`}
          >
             <div className="flex flex-col space-y-8 animate-fade-in px-2" style={{ animationDelay: '100ms' }}>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link, i) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-3xl font-heading tracking-widest text-white/90 hover:text-gold transition-all duration-300 group flex items-baseline gap-4 py-2 border-b border-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-[10px] font-sans text-gold opacity-50 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                      <span className="group-hover:translate-x-2 transition-transform duration-300">{link.label}</span>
                    </a>
                  ))}
  
                  {/* Policy Pages Submenu */}
                  <div className="pt-6 space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70 font-bold mb-2">Information</p>
                    <Link
                      to="/privacy-policy"
                      className="text-lg font-heading text-white/70 hover:text-white transition-all block pl-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      to="/shipping-policy"
                      className="text-lg font-heading text-white/70 hover:text-white transition-all block pl-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Shipping Policy
                    </Link>
                    <Link
                      to="/refund-policy"
                      className="text-lg font-heading text-white/70 hover:text-white transition-all block pl-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Refund & Return
                    </Link>
                  </div>
                </nav>
  

             </div>
          </div>
        </div>

        <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      </header>
    </>
  );
};

export default Header;
