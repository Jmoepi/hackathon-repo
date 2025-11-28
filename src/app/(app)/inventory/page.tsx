"use client";

import { useMemo, useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import {
  Table,
  TableHeader,   // thead
  TableRow,        // tr
  TableHead,       // th
  TableBody,       // tbody
  TableCell,       // td
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Minus, PlusCircle, AlertTriangle, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductDialog from "./components/add-product-dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
};

export default function InventoryPage() {
  const { products } = useShop();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatusFilter, setStockStatusFilter] =
    useState<"all" | "low" | "out">("all");

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const lowStockProducts = useMemo(
    () => localProducts.filter((p) => p.stock > 0 && p.stock < p.lowStockThreshold),
    [localProducts]
  );

  const filteredProducts = useMemo(() => {
    const bySearch = localProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (stockStatusFilter === "low")
      return bySearch.filter((p) => p.stock > 0 && p.stock < p.lowStockThreshold);
    if (stockStatusFilter === "out") return bySearch.filter((p) => p.stock === 0);
    return bySearch;
  }, [localProducts, searchTerm, stockStatusFilter]);

  const handleStockChange = (id: string, delta: number) => {
    setLocalProducts((curr) =>
      curr.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          if (newStock !== p.stock) {
            toast({
              title: "Stock Updated",
              description: `${p.name} stock updated to ${newStock}.`,
              duration: 2000,
            });
          }
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const handleAddProduct = (product: { name: string; stock: number; price: number }) => {
    setLocalProducts((curr) => [
      ...curr,
      {
        id: `prod-${Date.now()}`,
        name: product.name,
        stock: product.stock,
        price: product.price,
        lowStockThreshold: 3,
      },
    ]);
    setIsDialogOpen(false);
    toast({
      title: "Product Added",
      description: `${product.name} has been added to your inventory.`,
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const handleRemoveProduct = (id: string) => {
    const product = localProducts.find(p => p.id === id);
    setLocalProducts((curr) => curr.filter((p) => p.id !== id));
    if (product) {
      toast({
        title: "Product Removed",
        description: `${product.name} has been removed.`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 min-w-0 animate-in fade-in duration-500">
        {/* Low stock callout */}
        {lowStockProducts.length > 0 && stockStatusFilter === "all" && (
          <Card className="border-none shadow-md bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 min-w-0 animate-in slide-in-from-top-2 duration-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 min-w-0">
                <div className="p-2 bg-amber-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg">Low Stock Items</CardTitle>
              </div>
              <CardDescription className="text-amber-800/80 dark:text-amber-400/80 font-medium">
                Action Required: These items are running low and need restocking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto min-w-0 bg-white/50 dark:bg-black/20 rounded-lg p-2">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-amber-200/50">
                      <TableHead className="text-amber-900">Product</TableHead>
                      <TableHead className="text-right text-amber-900">Stock Left</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.length === 0
                      ? Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24 bg-amber-200/50" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 bg-amber-200/50" /></TableCell>
                        </TableRow>
                      ))
                      : lowStockProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-amber-100/50 border-amber-200/50">
                          <TableCell className="font-medium text-amber-900">{product.name}</TableCell>
                          <TableCell className="text-right font-bold text-amber-700">{product.stock}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full inventory */}
        <Card className="min-w-0 border-none shadow-md">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Full Inventory</CardTitle>
              <CardDescription>Track and manage all your product stock levels.</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 min-w-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name..."
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Tabs value={stockStatusFilter} onValueChange={(v) => setStockStatusFilter(v as any)}>
                <TabsList className="grid w-full grid-cols-3 md:w-auto bg-gray-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                  <TabsTrigger value="low" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Low Stock</TabsTrigger>
                  <TabsTrigger value="out" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Out of Stock</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-100 min-w-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-gray-100">
                    <TableHead className="font-semibold text-gray-600">Product Name</TableHead>
                    <TableHead className="text-right font-semibold text-gray-600">Price</TableHead>
                    <TableHead className="text-center font-semibold text-gray-600">Stock</TableHead>
                    <TableHead className="w-[110px] text-right font-semibold text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50/50 border-gray-100 transition-colors">
                        <TableCell className="font-medium text-gray-700">{product.name}</TableCell>
                        <TableCell className="text-right text-gray-600">R{product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={cn(
                                "font-bold",
                                product.stock === 0
                                  ? "text-destructive"
                                  : product.stock < product.lowStockThreshold
                                    ? "text-amber-600"
                                    : "text-gray-700"
                              )}
                            >
                              {product.stock}
                            </span>
                            {product.stock === 0 ? (
                              <Badge variant="destructive">Out</Badge>
                            ) : product.stock < product.lowStockThreshold ? (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-none">
                                Low
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => handleStockChange(product.id, -1)}
                              disabled={product.stock === 0}
                            >
                              <Minus className="h-4 w-4" />
                              <span className="sr-only">Decrease stock</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => handleStockChange(product.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Increase stock</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              <span className="sr-only">Remove product</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-900">No products found</p>
                          <p className="text-sm max-w-xs mx-auto mt-1">
                            We couldn't find any products matching your search or filters. Try adjusting them or add a new product.
                          </p>
                          <Button onClick={() => setIsDialogOpen(true)} variant="link" className="mt-2 text-primary">
                            Add New Product
                          </Button>
                        </div>
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
