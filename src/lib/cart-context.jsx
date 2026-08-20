import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'vibe_cart';

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setItems(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
            return [...prev, {
                id: product.id, name: product.name, brand: product.brand,
                price: product.price, image: product.image, qty
            }];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((id) => setItems(prev => prev.filter(i => i.id !== id)), []);
    const updateQty = useCallback((id, qty) => setItems(prev =>
        prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)), []);
    const clear = useCallback(() => setItems([]), []);
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);

    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);

    return (
        <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clear, isOpen, openCart, closeCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}