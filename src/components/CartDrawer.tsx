import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalPrice,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-0 pb-4">
          <SheetTitle className="font-heading text-2xl flex items-center gap-3">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <Button variant="gold" onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto py-4 -mx-6 px-6">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 mb-4 pb-4 border-b border-border animate-fade-in"
                >
                  {/* Product Image */}
                  <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-heading text-base truncate pr-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.product.size}
                    </p>
                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() =>
                            updateQuantity(item.product, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-secondary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-secondary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-gold font-semibold text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="pt-4 space-y-4">
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-heading text-xl">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Shipping & taxes calculated at checkout
              </p>
              <Button variant="gold" size="lg" className="w-full" asChild onClick={closeCart}>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button
                variant="luxuryOutline"
                size="lg"
                className="w-full"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
