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
import { getDirectUrl } from "@/lib/utils/imageUtils";

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
        className="text-base h-16 md:h-14 font-medium"
      />
      <CommandList className="max-h-[60vh] md:max-h-[300px] p-2">
        <CommandEmpty className="py-10 text-muted-foreground text-sm font-medium">
          No fragrances found.
        </CommandEmpty>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : (
          <>
            {/* Quick Suggestions if query is empty */}
            {!query && (
              <CommandGroup heading="Suggestions" className="pt-2 pb-4">
                 <div className="grid grid-cols-2 gap-2 px-1">
                  {["Best for Men", "Best for Women", "Unisex Collection", "Rose Scents"].map((item) => (
                    <CommandItem 
                      key={item} 
                      onSelect={() => setQuery(item.startsWith("Best for") ? item.replace("Best for ", "") : item.split(" ")[0])}
                      className="cursor-pointer border border-border/50 bg-muted/20 hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all py-3 rounded-xl justify-center text-center font-medium opacity-80 aria-selected:bg-gold/10 aria-selected:text-gold aria-selected:opacity-100"
                    >
                      {item}
                    </CommandItem>
                  ))}
                 </div>
              </CommandGroup>
            )}

            {query && filteredProducts.length > 0 && (
              <CommandGroup heading="Products" className="pb-4">
                {filteredProducts.map((product) => (
                  <CommandItem 
                    key={product.id} 
                    onSelect={() => handleSelect(product.id)} 
                    className="flex items-center gap-4 cursor-pointer p-3 rounded-xl mb-1 data-[selected=true]:bg-gold/20 data-[selected=true]:text-white transition-colors group"
                  >
                    <div className="h-12 w-12 bg-white rounded-lg overflow-hidden shrink-0 border border-border flex items-center justify-center p-1">
                      {product.images?.[0] ? (
                        <img src={getDirectUrl(product.images[0])} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-muted/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-base truncate data-[selected=true]:text-gold transition-colors">{product.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate group-data-[selected=true]:text-white/70">{product.category} • {product.size}</p>
                    </div>
                    <span className="text-sm font-bold text-gold shrink-0">{formatPrice(product.price)}</span>
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
