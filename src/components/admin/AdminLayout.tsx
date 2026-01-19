import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Home, Menu, Gift, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AdminLayout = ({ children, activeTab, onTabChange }: AdminLayoutProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Package, label: "Products", href: "/admin", id: "products" },
    { icon: Gift, label: "Gift Sets", href: "/admin", id: "gift-sets" },
    { icon: ShoppingCart, label: "Orders", href: "/admin", id: "orders" },
    { icon: Menu, label: "Reviews", href: "/admin", id: "reviews" },
    { icon: Settings, label: "Settings", href: "/admin", id: "settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-heading tracking-widest text-gold uppercase">Puniora</span>
        </Link>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mt-1">Admin Panel</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          onTabChange ? (
            <button
              key={item.label}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2 rounded-sm transition-colors text-left",
                activeTab === item.id
                  ? "bg-gold/10 text-gold"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-sm transition-colors",
                location.pathname === item.href
                  ? "bg-gold/10 text-gold"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm font-medium">Main Site</span>
        </Link>
        <button
          className="flex w-full items-center gap-3 px-4 py-2 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col fixed inset-y-0 bg-background z-20">
        <SidebarContent />
      </aside>



      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
