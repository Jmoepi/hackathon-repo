
"use client";

import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Plus, Minus, PlusCircle, AlertTriangle, Search } from 'lucide-react';
import { initialProducts, type Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import AddProductDialog from './components/add-product-dialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  const handleStockChange = (productId: string, amount: number) => {
    setProducts((currentProducts) =>
      currentProducts.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p
      )
    );
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'lowStockThreshold' | 'unitsSold'>) => {
    const product: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      lowStockThreshold: 10, // default value
      unitsSold: 0,
    };
    setProducts((currentProducts) => [product, ...currentProducts]);
  };
  
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < p.lowStockThreshold);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product => {
        if (stockStatusFilter === 'all') return true;
        if (stockStatusFilter === 'low') return product.stock > 0 && product.stock < product.lowStockThreshold;
        if (stockStatusFilter === 'out') return product.stock === 0;
        return true;
      });
  }, [products, searchTerm, stockStatusFilter]);

  return (
    <>
    <div className="flex flex-col gap-6">
      {lowStockProducts.length > 0 && stockStatusFilter === 'all' && (
        <Card className="border-amber-500 bg-amber-50/50 dark:bg-amber-900/10">
            <CardHeader>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="h-5 w-5"/>
                    <CardTitle>Low Stock Items</CardTitle>
                </div>
                <CardDescription className="text-amber-600/80 dark:text-amber-500/80">These items are running low and may need to be restocked soon.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Stock Left</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.length === 0
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          </TableRow>
                        ))
                      : lowStockProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-right font-bold">{product.stock}</TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Full Inventory</CardTitle>
            <CardDescription>Track and manage all your product stock levels.</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            <Tabs value={stockStatusFilter} onValueChange={setStockStatusFilter}>
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="low">Low Stock</TabsTrigger>
                <TabsTrigger value="out">Out of Stock</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="w-[110px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">R{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <span className={cn(
                          'font-bold',
                          product.stock === 0 ? 'text-destructive' :
                          product.stock < product.lowStockThreshold ? 'text-amber-600' : 'text-foreground'
                        )}>
                          {product.stock}
                        </span>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Out</Badge>
                        ) : product.stock < product.lowStockThreshold && (
                          <Badge className="bg-amber-500 text-white hover:bg-amber-500/80">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStockChange(product.id, -1)}
                          disabled={product.stock === 0}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Decrease stock</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStockChange(product.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                           <span className="sr-only">Increase stock</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No products match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
      <AddProductDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddProduct={handleAddProduct}
      />
    </>
  );
}
