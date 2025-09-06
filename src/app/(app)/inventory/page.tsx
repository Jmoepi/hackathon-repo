"use client";

import { useMemo, useState } from "react";
import { useShop } from "@/context/ShopContext";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
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

// If you have a Product type exported elsewhere, import it instead:
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
};

export default function InventoryPage() {
  // Pull products from your context
  const { products } = useShop();

  // Local UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "low" | "out">("all");

  // OPTIONAL: keep a local copy to demo stock changes without wiring context updates
  const [localProducts, setLocalProducts] = useState<Product[]>(products);

  // Keep local in sync if context changes (optional)
  // You can remove this if you plan to update context directly
  // useEffect(() => setLocalProducts(products), [products]);

  const lowStockProducts = useMemo(
    () => localProducts.filter((p) => p.stock > 0 && p.stock < p.lowStockThreshold),
    [localProducts]
  );

  const filteredProducts = useMemo(() => {
    const bySearch = localProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (stockStatusFilter === "low") return bySearch.filter((p) => p.stock > 0 && p.stock < p.lowStockThreshold);
    if (stockStatusFilter === "out") return bySearch.filter((p) => p.stock === 0);
    return bySearch;
  }, [localProducts, searchTerm, stockStatusFilter]);

  // Handlers (all BEFORE return)

  const handleStockChange = (id: string, delta: number) => {
    // Demo-only local update. If you have a context method (e.g., updateProductStock),
    // call that instead and remove local state.
    setLocalProducts((curr) =>
      curr.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleAddProduct = (product: { name: string; stock: number; price: number }) => {
    // Demo-only: add with generated id & default lowStockThreshold
    setLocalProducts((curr) => [
      ...curr,
      {
        id: `prod-${Date.now()}`,
        name: product.name,
        stock: product.stock,
        price: product.price,
        lowStockThreshold: 3, // tweak as you like
      },
    ]);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Low stock callout */}
        {lowStockProducts.length > 0 && stockStatusFilter === "all" && (
          <Card className="border-amber-500 bg-amber-50/50 dark:bg-amber-900/10">
            <CardHeader>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Low Stock Items</CardTitle>
              </div>
              <CardDescription className="text-amber-600/80 dark:text-amber-500/80">
                These items are running low and may need to be restocked soon.
              </CardDescription>
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
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-12" />
                            </TableCell>
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

        {/* Full inventory */}
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

              <Tabs value={stockStatusFilter} onValueChange={(v) => setStockStatusFilter(v as any)}>
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
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">
                          R{product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={cn(
                                "font-bold",
                                product.stock === 0
                                  ? "text-destructive"
                                  : product.stock < product.lowStockThreshold
                                  ? "text-amber-600"
                                  : "text-foreground"
                              )}
                            >
                              {product.stock}
                            </span>
                            {product.stock === 0 ? (
                              <Badge variant="destructive">Out</Badge>
                            ) : (
                              product.stock < product.lowStockThreshold && (
                                <Badge className="bg-amber-500 text-white hover:bg-amber-500/80">
                                  Low
                                </Badge>
                              )
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
                    ))
                  ) : (
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
