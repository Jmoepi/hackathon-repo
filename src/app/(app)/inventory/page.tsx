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
import { Plus, Minus, PlusCircle } from 'lucide-react';
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

  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'lowStockThreshold'>) => {
    const product: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      lowStockThreshold: 10, // default value
    };
    setProducts((currentProducts) => [product, ...currentProducts]);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>Track and manage your product stock levels.</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
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
                  <TableHead className="text-right">Actions</TableHead>
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
      <AddProductDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddProduct={handleAddProduct}
      />
    </>
  );
}
