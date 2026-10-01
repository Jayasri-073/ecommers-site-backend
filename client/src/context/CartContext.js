import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    const { data } = await api.post("/cart", { bookId, quantity });
    setCart(data.cart);
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    setCart(data.cart);
  };

  const removeFromCart = async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    setCart(data.cart);
  };

  useEffect(() => {
    fetchCart().catch(() => setCart({ items: [] }));
  }, [isAuthenticated]);

  const total = cart.items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      cart,
      loading,
      total,
      count,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart
    }),
    [cart, loading, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
