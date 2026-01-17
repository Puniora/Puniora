import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product, formatPrice } from "@/lib/products";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (product: Product) => void;
  updateQuantity: (product: Product, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedItems = localStorage.getItem("cartItems");
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existingItem = prev.find((item) =>
        item.product.id === product.id &&
        item.product.size === product.size &&
        item.product.selectedNote === product.selectedNote
      );
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id &&
            item.product.size === product.size &&
            item.product.selectedNote === product.selectedNote
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`, {
      description: formatPrice(product.price),
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((product: Product) => {
    setItems((prev) => prev.filter((item) =>
      !(item.product.id === product.id &&
        item.product.size === product.size &&
        item.product.selectedNote === product.selectedNote)
    ));
  }, []);

  const updateQuantity = useCallback((product: Product, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(product);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === product.id &&
          item.product.size === product.size &&
          item.product.selectedNote === product.selectedNote
          ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
