import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  Package, 
  MapPin, 
  ArrowLeft, 
  ShoppingCart, 
  Truck, 
  CheckCircle2, 
  Clock,
  Shield,
  Store,
  Filter
} from "lucide-react";
import type { Product, Order, UserProfile } from "@shared/schema";

const categories = [
  { value: "material", label: "Material Konstruksi" },
  { value: "equipment", label: "Alat & Equipment" },
  { value: "service", label: "Jasa" },
];

const orderStatusLabels: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  escrow: "Dalam Escrow",
  shipped: "Dikirim",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

export default function Marketplace() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "material",
    price: "",
    unit: "",
    location: "",
  });
  const [orderDetails, setOrderDetails] = useState({
    quantity: 1,
    shippingAddress: "",
    notes: "",
    paymentMethod: "transfer",
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: myProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/my-products"],
    enabled: !!profile,
  });

  const { data: ordersData } = useQuery<{ buyerOrders: Order[]; sellerOrders: Order[] }>({
    queryKey: ["/api/my-orders"],
    enabled: !!profile,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      toast({ title: "Produk berhasil ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
      setShowAddDialog(false);
      setNewProduct({ name: "", description: "", category: "material", price: "", unit: "", location: "" });
    },
    onError: () => {
      toast({ title: "Gagal menambahkan produk", variant: "destructive" });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/orders", data),
    onSuccess: () => {
      toast({ title: "Pesanan berhasil dibuat! Pembayaran akan masuk ke Escrow." });
      queryClient.invalidateQueries({ queryKey: ["/api/my-orders"] });
      setShowOrderDialog(false);
      setSelectedProduct(null);
      setOrderDetails({ quantity: 1, shippingAddress: "", notes: "", paymentMethod: "transfer" });
    },
    onError: () => {
      toast({ title: "Gagal membuat pesanan", variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status, escrowReleased }: { id: number; status: string; escrowReleased?: boolean }) =>
      apiRequest("PATCH", `/api/orders/${id}/status`, { status, escrowReleased }),
    onSuccess: () => {
      toast({ title: "Status pesanan diperbarui" });
      queryClient.invalidateQueries({ queryKey: ["/api/my-orders"] });
    },
  });

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.category) {
      toast({ title: "Isi nama, deskripsi, dan kategori", variant: "destructive" });
      return;
    }
    createProductMutation.mutate(newProduct);
  };

  const handleOrder = () => {
    if (!selectedProduct || !orderDetails.shippingAddress) {
      toast({ title: "Isi alamat pengiriman", variant: "destructive" });
      return;
    }
    createOrderMutation.mutate({
      productId: selectedProduct.id,
      quantity: orderDetails.quantity,
      shippingAddress: orderDetails.shippingAddress,
      notes: orderDetails.notes,
      paymentMethod: orderDetails.paymentMethod,
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const buyerOrders = ordersData?.buyerOrders || [];
  const sellerOrders = ordersData?.sellerOrders || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Marketplace Pasok
              </h1>
              <p className="text-sm text-muted-foreground">Material, Alat & Jasa Konstruksi</p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" /> Jual Produk
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Produk *</Label>
                  <Input
                    placeholder="Nama produk..."
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    data-testid="input-product-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi *</Label>
                  <Textarea
                    placeholder="Deskripsi produk..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={3}
                    data-testid="input-product-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Harga</Label>
                    <Input
                      placeholder="Rp 0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      data-testid="input-product-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Satuan</Label>
                    <Input
                      placeholder="kg, m3, unit..."
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      data-testid="input-product-unit"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input
                    placeholder="Lokasi produk..."
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                    data-testid="input-product-location"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateProduct} disabled={createProductMutation.isPending} data-testid="button-submit-product">
                  {createProductMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="browse" data-testid="tab-browse">
              <Package className="w-4 h-4 mr-2" /> Produk
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingCart className="w-4 h-4 mr-2" /> Pesanan
            </TabsTrigger>
            <TabsTrigger value="my-products" data-testid="tab-my-products">
              <Store className="w-4 h-4 mr-2" /> Produk Saya
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-products"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-category-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Pembayaran Escrow Aman</h3>
                    <p className="text-sm text-muted-foreground">
                      Uang Anda dilindungi sampai barang diterima dengan baik
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="py-6">
                      <div className="h-32 bg-muted rounded-md mb-4" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Belum ada produk tersedia</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Jual Produk Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                        <Badge variant="secondary">
                          {categories.find((c) => c.value === product.category)?.label || product.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.price && (
                            <p className="font-semibold text-primary">{product.price}</p>
                          )}
                          {product.unit && (
                            <p className="text-xs text-muted-foreground">per {product.unit}</p>
                          )}
                        </div>
                        {product.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {product.location}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowOrderDialog(true);
                        }}
                        data-testid={`button-order-${product.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Pesan
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-lg font-semibold">Pesanan Saya (Sebagai Pembeli)</h2>
            {buyerOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Belum ada pesanan</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyerOrders.map((order) => (
                  <Card key={order.id} data-testid={`order-buyer-${order.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">Pesanan #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: {order.totalPrice || "-"} | Qty: {order.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                            {orderStatusLabels[order.status || "pending"] || order.status}
                          </Badge>
                          {order.status === "delivered" && !order.escrowReleased && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderMutation.mutate({ id: order.id, status: "completed", escrowReleased: true })}
                              data-testid={`button-confirm-${order.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Konfirmasi Terima
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <h2 className="text-lg font-semibold mt-8">Pesanan Masuk (Sebagai Penjual)</h2>
            {sellerOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Truck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Belum ada pesanan masuk</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellerOrders.map((order) => (
                  <Card key={order.id} data-testid={`order-seller-${order.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">Pesanan #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: {order.totalPrice || "-"} | Qty: {order.quantity}
                          </p>
                          {order.shippingAddress && (
                            <p className="text-sm text-muted-foreground">
                              Kirim ke: {order.shippingAddress}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                            {orderStatusLabels[order.status || "pending"] || order.status}
                          </Badge>
                          {order.status === "escrow" && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderMutation.mutate({ id: order.id, status: "shipped" })}
                              data-testid={`button-ship-${order.id}`}
                            >
                              <Truck className="w-4 h-4 mr-1" /> Kirim
                            </Button>
                          )}
                          {order.status === "shipped" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderMutation.mutate({ id: order.id, status: "delivered" })}
                              data-testid={`button-delivered-${order.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Tandai Terkirim
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-products" className="space-y-6">
            {myProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Anda belum memiliki produk</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Produk
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProducts.map((product) => (
                  <Card key={product.id} data-testid={`my-product-${product.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                        <Badge variant={product.isAvailable ? "default" : "secondary"}>
                          {product.isAvailable ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      {product.price && (
                        <p className="font-semibold text-primary">
                          {product.price} {product.unit && `/ ${product.unit}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Pesanan</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">{selectedProduct.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                {selectedProduct.price && (
                  <p className="font-semibold text-primary mt-2">
                    {selectedProduct.price} {selectedProduct.unit && `/ ${selectedProduct.unit}`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  min={1}
                  value={orderDetails.quantity}
                  onChange={(e) => setOrderDetails({ ...orderDetails, quantity: parseInt(e.target.value) || 1 })}
                  data-testid="input-order-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label>Alamat Pengiriman *</Label>
                <Textarea
                  placeholder="Alamat lengkap pengiriman..."
                  value={orderDetails.shippingAddress}
                  onChange={(e) => setOrderDetails({ ...orderDetails, shippingAddress: e.target.value })}
                  rows={3}
                  data-testid="input-order-address"
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Input
                  placeholder="Catatan untuk penjual..."
                  value={orderDetails.notes}
                  onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })}
                  data-testid="input-order-notes"
                />
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-medium">Pembayaran Escrow</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uang akan ditahan oleh sistem sampai Anda konfirmasi barang diterima dengan baik
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleOrder} disabled={createOrderMutation.isPending} data-testid="button-submit-order">
              {createOrderMutation.isPending ? "Memproses..." : "Buat Pesanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
