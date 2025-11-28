"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';
import * as productService from '@/lib/supabase/services/products';
import * as transactionService from '@/lib/supabase/services/transactions';
import * as customerService from '@/lib/supabase/services/customers';
import { initialProducts, initialTransactions, initialCustomers } from '@/lib/data';
import type { 
  Product as SupabaseProduct, 
  Transaction as SupabaseTransaction,
  Customer as SupabaseCustomer,
} from '@/lib/supabase/types';

// Frontend-friendly types (matching the UI expectations)
export type Product = {
  id: string;
  name: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  unitsSold: number;
  category?: string;
  imageUrl?: string;
};

export type Transaction = {
  id: string;
  amount: number;
  date: string;
  customer: string;
  status: 'Completed' | 'Pending';
  paymentMethod?: string;
  reference?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  joined: string;
  totalSpent?: number;
  lastVisit?: string;
};

// Transform Supabase product to frontend product
function transformProduct(p: SupabaseProduct): Product {
  return {
    id: p.id,
    name: p.name,
    stock: p.stock ?? 0,
    price: p.price ?? 0,
    lowStockThreshold: p.low_stock_threshold ?? 10,
    unitsSold: p.units_sold ?? 0,
    category: p.category ?? undefined,
    imageUrl: p.image_url ?? undefined,
  };
}

// Transform Supabase transaction to frontend transaction
function transformTransaction(t: SupabaseTransaction): Transaction {
  return {
    id: t.id,
    amount: t.amount ?? 0,
    date: t.created_at,
    customer: t.customer_name || t.customer_id || 'Walk-in',
    status: t.status === 'completed' ? 'Completed' : 'Pending',
    paymentMethod: t.payment_method ?? undefined,
    reference: t.reference ?? undefined,
  };
}

// Transform Supabase customer to frontend customer
function transformCustomer(c: SupabaseCustomer): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email ?? undefined,
    joined: c.created_at.split('T')[0],
    totalSpent: c.total_spent ?? 0,
    lastVisit: c.last_visit ?? undefined,
  };
}

interface ShopContextType {
  // Data
  products: Product[];
  transactions: Transaction[];
  customers: Customer[];
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  
  // Product operations
  addProduct: (product: Omit<Product, 'id' | 'unitsSold'>) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Sale operations
  sellProduct: (productId: string, amount: number, quantity?: number, customerName?: string) => Promise<boolean>;
  recordSale: (items: Array<{ productId: string; quantity: number; price: number }>, customerName?: string, paymentMethod?: string) => Promise<Transaction | null>;
  
  // Transaction operations
  getRecentTransactions: (limit?: number) => Transaction[];
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id' | 'joined'>) => Promise<Customer | null>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  
  // Refresh data
  refreshProducts: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  const supabase = createClient();

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && url !== 'https://placeholder.supabase.co';
  };

  // Load data from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const [productsData, transactionsData, customersData] = await Promise.all([
        productService.getProducts(user.id),
        transactionService.getTransactions(user.id),
        customerService.getCustomers(user.id),
      ]);

      setProducts(productsData.map(transformProduct));
      setTransactions(transactionsData.map(transformTransaction));
      setCustomers(customersData.map(transformCustomer));
      
      return true;
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      return false;
    }
  }, [user?.id]);

  // Load data from localStorage (fallback)
  const loadFromLocalStorage = useCallback(() => {
    const storedProducts = localStorage.getItem('tradahub-products');
    const storedTransactions = localStorage.getItem('tradahub-transactions');
    const storedCustomers = localStorage.getItem('tradahub-customers');

    setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts);
    setTransactions(storedTransactions ? JSON.parse(storedTransactions) : initialTransactions);
    setCustomers(storedCustomers ? JSON.parse(storedCustomers) : initialCustomers.map(c => ({
      ...c,
      totalSpent: 0,
    })));
  }, []);

  // Save to localStorage (when using fallback mode)
  const saveToLocalStorage = useCallback(() => {
    if (useLocalStorage) {
      localStorage.setItem('tradahub-products', JSON.stringify(products));
      localStorage.setItem('tradahub-transactions', JSON.stringify(transactions));
      localStorage.setItem('tradahub-customers', JSON.stringify(customers));
    }
  }, [products, transactions, customers, useLocalStorage]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      setIsLoading(true);

      // If authenticated and Supabase is configured, load from Supabase
      if (isAuthenticated && user?.id && isSupabaseConfigured()) {
        const success = await loadFromSupabase();
        
        if (success) {
          setUseLocalStorage(false);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to localStorage
      console.log('Using localStorage for data storage');
      setUseLocalStorage(true);
      loadFromLocalStorage();
      setIsInitialized(true);
      setIsLoading(false);
    };

    initializeData();
  }, [authLoading, isAuthenticated, user?.id, loadFromSupabase, loadFromLocalStorage]);

  // Save to localStorage when data changes (if in localStorage mode)
  useEffect(() => {
    if (isInitialized && useLocalStorage) {
      saveToLocalStorage();
    }
  }, [isInitialized, useLocalStorage, saveToLocalStorage]);

  // Set up real-time subscription for Supabase
  useEffect(() => {
    if (!isAuthenticated || !user?.id || useLocalStorage || !isSupabaseConfigured()) {
      return;
    }

    // Subscribe to products changes
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // Refresh products on any change
          const data = await productService.getProducts(user.id);
          setProducts(data.map(transformProduct));
        }
      )
      .subscribe();

    // Subscribe to transactions changes
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // Refresh transactions on any change
          const data = await transactionService.getTransactions(user.id);
          setTransactions(data.map(transformTransaction));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [isAuthenticated, user?.id, useLocalStorage, supabase]);

  // Refresh functions
  const refreshProducts = async () => {
    if (user?.id && !useLocalStorage) {
      const data = await productService.getProducts(user.id);
      setProducts(data.map(transformProduct));
    }
  };

  const refreshTransactions = async () => {
    if (user?.id && !useLocalStorage) {
      const data = await transactionService.getTransactions(user.id);
      setTransactions(data.map(transformTransaction));
    }
  };

  const refreshCustomers = async () => {
    if (user?.id && !useLocalStorage) {
      const data = await customerService.getCustomers(user.id);
      setCustomers(data.map(transformCustomer));
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshProducts(), refreshTransactions(), refreshCustomers()]);
  };

  // Add a new product
  const addProduct = async (product: Omit<Product, 'id' | 'unitsSold'>): Promise<Product | null> => {
    try {
      if (!useLocalStorage && user?.id) {
        const newProduct = await productService.createProduct({
          user_id: user.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category || 'General',
          low_stock_threshold: product.lowStockThreshold,
          units_sold: 0,
        });
        
        const transformed = transformProduct(newProduct);
        setProducts(prev => [transformed, ...prev]);
        return transformed;
      } else {
        // localStorage fallback
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          unitsSold: 0,
        };
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  };

  // Update a product
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      if (!useLocalStorage && user?.id) {
        await productService.updateProduct(id, {
          name: updates.name,
          price: updates.price,
          stock: updates.stock,
          category: updates.category,
          low_stock_threshold: updates.lowStockThreshold,
          image_url: updates.imageUrl,
        });
        await refreshProducts();
      } else {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      }
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  };

  // Delete a product
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      if (!useLocalStorage) {
        await productService.deleteProduct(id);
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  };

  // Sell a product (simple version - single item)
  const sellProduct = async (
    productId: string, 
    amount: number, 
    quantity: number = 1, 
    customerName?: string
  ): Promise<boolean> => {
    try {
      if (!useLocalStorage && user?.id) {
        // Update product stock and units sold
        await productService.incrementUnitsSold(productId, quantity);
        
        // Create transaction
        const reference = transactionService.generateTransactionReference();
        await transactionService.createTransaction({
          user_id: user.id,
          amount,
          customer_name: customerName || 'Walk-in',
          status: 'completed',
          payment_method: 'cash',
          reference,
        });
        
        // Refresh data
        await Promise.all([refreshProducts(), refreshTransactions()]);
      } else {
        // localStorage fallback
        setProducts(prev => prev.map(p =>
          p.id === productId
            ? { ...p, stock: Math.max(0, p.stock - quantity), unitsSold: p.unitsSold + quantity }
            : p
        ));
        
        const newTransaction: Transaction = {
          id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          amount,
          date: new Date().toISOString(),
          customer: customerName || 'Walk-in',
          status: 'Completed',
        };
        setTransactions(prev => [newTransaction, ...prev]);
      }
      
      return true;
    } catch (error) {
      console.error('Error selling product:', error);
      return false;
    }
  };

  // Record a sale with multiple items
  const recordSale = async (
    items: Array<{ productId: string; quantity: number; price: number }>,
    customerName?: string,
    paymentMethod: string = 'cash'
  ): Promise<Transaction | null> => {
    try {
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      if (!useLocalStorage && user?.id) {
        // Update all products
        await Promise.all(
          items.map(item => productService.incrementUnitsSold(item.productId, item.quantity))
        );
        
        // Create transaction
        const reference = transactionService.generateTransactionReference();
        const transaction = await transactionService.createTransaction({
          user_id: user.id,
          amount: totalAmount,
          customer_name: customerName || 'Walk-in',
          status: 'completed',
          payment_method: paymentMethod as 'cash' | 'card' | 'mobile' | 'qr',
          reference,
        });
        
        // Refresh data
        await Promise.all([refreshProducts(), refreshTransactions()]);
        
        return transformTransaction(transaction);
      } else {
        // localStorage fallback
        setProducts(prev => prev.map(p => {
          const item = items.find(i => i.productId === p.id);
          if (item) {
            return { 
              ...p, 
              stock: Math.max(0, p.stock - item.quantity), 
              unitsSold: p.unitsSold + item.quantity 
            };
          }
          return p;
        }));
        
        const newTransaction: Transaction = {
          id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          amount: totalAmount,
          date: new Date().toISOString(),
          customer: customerName || 'Walk-in',
          status: 'Completed',
          paymentMethod,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        
        return newTransaction;
      }
    } catch (error) {
      console.error('Error recording sale:', error);
      return null;
    }
  };

  // Get recent transactions
  const getRecentTransactions = (limit: number = 10): Transaction[] => {
    return transactions.slice(0, limit);
  };

  // Add a customer
  const addCustomer = async (customer: Omit<Customer, 'id' | 'joined'>): Promise<Customer | null> => {
    try {
      if (!useLocalStorage && user?.id) {
        const newCustomer = await customerService.createCustomer({
          user_id: user.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          total_spent: customer.totalSpent || 0,
        });
        
        const transformed = transformCustomer(newCustomer);
        setCustomers(prev => [transformed, ...prev]);
        return transformed;
      } else {
        const newCustomer: Customer = {
          ...customer,
          id: `C-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          joined: new Date().toISOString().split('T')[0],
        };
        setCustomers(prev => [newCustomer, ...prev]);
        return newCustomer;
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  };

  // Update a customer
  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    try {
      if (!useLocalStorage) {
        await customerService.updateCustomer(id, {
          name: updates.name,
          phone: updates.phone,
          email: updates.email || null,
        });
        await refreshCustomers();
      } else {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      }
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      return false;
    }
  };

  // Delete a customer
  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      if (!useLocalStorage) {
        await customerService.deleteCustomer(id);
      }
      setCustomers(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  };

  return (
    <ShopContext.Provider value={{
      products,
      transactions,
      customers,
      isLoading,
      isInitialized,
      addProduct,
      updateProduct,
      deleteProduct,
      sellProduct,
      recordSale,
      getRecentTransactions,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      refreshProducts,
      refreshTransactions,
      refreshCustomers,
      refreshAll,
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export default ShopContext;
