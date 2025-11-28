"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProducts, initialTransactions, Product, Transaction } from '@/lib/data';

interface ShopContextType {
  products: Product[];
  transactions: Transaction[];
  sellProduct: (productId: string, amount: number) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    const storedTransactions = localStorage.getItem('transactions');

    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (e) {
        console.error("Failed to parse products from local storage", e);
      }
    }
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (e) {
        console.error("Failed to parse transactions from local storage", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions, isInitialized]);

  const sellProduct = (productId: string, amount: number) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, stock: Math.max(0, p.stock - 1), unitsSold: p.unitsSold + 1 }
        : p
    ));
    setTransactions(prev => [
      {
        id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount,
        date: new Date().toISOString(),
        customer: 'Demo',
        status: 'Completed',
      },
      ...prev,
    ]);
  };

  return (
    <ShopContext.Provider value={{ products, transactions, sellProduct }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
