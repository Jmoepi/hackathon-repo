"use client";

import { useMemo, useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Minus, PlusCircle, AlertTriangle, Search, Package, X, Boxes } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatusFilter, setStockStatusFilter] =
    useState<"all" | "low" | "out">("all");

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
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

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">Inventory</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your product stock levels</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 w-full sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Low stock alert - Mobile optimized */}
        {lowStockProducts.length > 0 && stockStatusFilter === "all" && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">Low Stock Alert</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                    {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} need restocking
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {lowStockProducts.slice(0, 3).map(p => (
                      <Badge key={p.id} variant="secondary" className="bg-amber-100 text-amber-800 border-0">
                        {p.name}: {p.stock} left
                      </Badge>
                    ))}
                    {lowStockProducts.length > 3 && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0">
                        +{lowStockProducts.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters - Mobile optimized */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-12 bg-card border-border/50 rounded-xl text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs value={stockStatusFilter} onValueChange={(v) => setStockStatusFilter(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                All ({localProducts.length})
              </TabsTrigger>
              <TabsTrigger value="low" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                Low ({lowStockProducts.length})
              </TabsTrigger>
              <TabsTrigger value="out" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                Out ({localProducts.filter(p => p.stock === 0).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Product Cards - Mobile first grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className={cn(
                  "border-0 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
                  product.stock === 0 && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "p-3 rounded-xl shrink-0",
                        product.stock === 0 
                          ? "bg-red-100 dark:bg-red-900/30" 
                          : product.stock < product.lowStockThreshold
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                      )}>
                        <Package className={cn(
                          "h-5 w-5",
                          product.stock === 0 
                            ? "text-red-600" 
                            : product.stock < product.lowStockThreshold
                              ? "text-amber-600"
                              : "text-blue-600"
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                        <p className="text-lg font-bold text-primary">R{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.stock === 0 ? (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      ) : product.stock < product.lowStockThreshold ? (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Low Stock</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-xs">In Stock</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg hover:bg-white"
                        onClick={() => handleStockChange(product.id, -1)}
                        disabled={product.stock === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg">{product.stock}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg hover:bg-white"
                        onClick={() => handleStockChange(product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Boxes className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No products found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                {searchTerm ? "Try a different search term" : "Add your first product to get started"}
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddProductDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddProduct={handleAddProduct}
      />
    </>
  );
}
