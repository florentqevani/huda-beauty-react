import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCart, addToCartAPI, updateCartItemAPI, removeFromCartAPI } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadCart = useCallback(async () => {
        if (!user) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchCart();
            setItems(Array.isArray(data) ? data : []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const addToCart = async (productId, quantity = 1) => {
        await addToCartAPI(productId, quantity);
        await loadCart();
    };

    const updateQuantity = async (cartItemId, quantity) => {
        await updateCartItemAPI(cartItemId, quantity);
        await loadCart();
    };

    const removeItem = async (cartItemId) => {
        await removeFromCartAPI(cartItemId);
        await loadCart();
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, cartCount, cartTotal, loadCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
