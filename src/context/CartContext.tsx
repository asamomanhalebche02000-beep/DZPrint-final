import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateItemImage: (id: string, imageUrl: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dzprint_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dzprint_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: CartItem = { ...item, id };
    setCart(prev => [newItem, ...prev]);
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateItemImage = (id: string, imageUrl: string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            uploaded_design_url: imageUrl,
            customization: {
              ...(item.customization || {
                scale: 1,
                x: 0,
                y: 0,
                rotation: 0,
                placement: 'front',
              }),
              image_url: imageUrl,
            },
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, it) => sum + it.quantity, 0);
  const cartSubtotal = cart.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        updateItemImage,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
