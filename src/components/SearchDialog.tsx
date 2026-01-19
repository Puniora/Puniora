import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { productService } from "@/lib/services/productService";
import { Product, formatPrice } from "@/lib/products";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const fetchProducts = async () => {
        try {
            // Using cached approach or basic fetch since product list is small
            // Ideally we'd have a search endpoint, but client-side filtering is fine for < 100 products
            if (products.length === 0) {
               setLoading(true);
               const data = await productService.getProducts();
               setProducts(data.filter(p => !p.isHidden));
            }
        } catch (error) {
            console.error("Failed to load products for search", error);
        } finally {
            setLoading(false);
        }
      };
      
      fetchProducts();
    }
  }, [open]);

  const filteredProducts = products.filter((product) => {
      const searchLower = query.toLowerCase();
      return (
          product.name.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.notes.some(note => note.toLowerCase().includes(searchLower)) ||
          product.description.toLowerCase().includes(searchLower)
      );
  });

  const handleSelect = (productId: string) => {
    navigate(`/product/${productId}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search perfumes, notes, or categories..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {loading ? (
             <div className="py-6 flex justify-center">
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
             </div>
        ) : (
            <>
               {/* Quick Suggestions if query is empty */}
               {!query && (
                   <CommandGroup heading="Suggestions">
                       <CommandItem onSelect={() => setQuery("Men")}>Best for Men</CommandItem>
                       <CommandItem onSelect={() => setQuery("Women")}>Best for Women</CommandItem>
                       <CommandItem onSelect={() => setQuery("Unisex")}>Unisex Collection</CommandItem>
                       <CommandItem onSelect={() => setQuery("Rose")}>Rose Scents</CommandItem>
                   </CommandGroup>
               )}

               {query && filteredProducts.length > 0 && (
                   <CommandGroup heading="Products">
                        {filteredProducts.map((product) => (
                            <CommandItem key={product.id} onSelect={() => handleSelect(product.id)} className="flex items-center gap-3 cursor-pointer">
                                <div className="h-10 w-10 bg-muted rounded-md overflow-hidden shrink-0 border border-border/50">
                                   {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-heading text-sm">{product.name}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{product.category} • {product.size}</p>
                                </div>
                                <span className="text-xs font-bold text-gold">{formatPrice(product.price)}</span>
                            </CommandItem>
                        ))}
                   </CommandGroup>
               )}
            </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchDialog;
