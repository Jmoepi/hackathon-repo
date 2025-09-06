
"use client";

import { useState } from 'react';
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
import { Plus, Minus, PlusCircle, AlertTriangle } from 'lucide-react';
import { initialProducts, type Product } from '@/lib/data';
import AddProductDialog from './components/add-product-dialog';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
  
  const lowStockProducts = products.filter(p => p.stock < p.lowStockThreshold);

  return (
    <>
    <div className="flex flex-col gap-6">
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive">
            <CardHeader>
                <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5"/>
                    <CardTitle>Low Stock Items</CardTitle>
                </div>
                <CardDescription>These items are running low and may need to be restocked soon.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right font-bold">{product.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        <CardContent>
          <div className="overflow-x-auto">
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
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">R{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <span className={cn(
                          'font-bold',
                          product.stock < product.lowStockThreshold ? 'text-destructive' : 'text-foreground'
                        )}>
                          {product.stock}
                        </span>
                        {product.stock < product.lowStockThreshold && (
                          <Badge variant="destructive">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStockChange(product.id, -1)}
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
                ))}
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
