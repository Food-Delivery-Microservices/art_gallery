import React, { createContext, useContext, useState, useEffect } from "react";
import type { Artwork } from "@/data/artworks";

interface CartItem extends Artwork {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: number | string) => void;
  updateQuantity: (artworkId: number | string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => string;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("artGalleryCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("artGalleryCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (artwork: Artwork) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => String(item.id) === String(artwork.id));
      if (existingItem) {
        return prevItems.map((item) =>
          String(item.id) === String(artwork.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...artwork, quantity: 1 }];
    });
    console.log('after adding',cartItems)
  };

  const removeFromCart = (artworkId: number | string) => {
    setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(artworkId)));
  };

  const updateQuantity = (artworkId: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.id) === String(artworkId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      console.log('qwertyui', typeof(item.price) ,item)
      const price = typeof(item.price)== 'number'?parseFloat(item.price):parseFloat(item.price.replace(/[₹,]/g, ""));
      return sum + price * item.quantity;
    }, 0);
    return `₹${total.toLocaleString("en-IN")}`;
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
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

// Made with Bob
