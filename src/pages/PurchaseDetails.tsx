import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { orderApi } from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";

const PurchaseDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await orderApi.getAll();
        console.log('response',response)
        // Handle both array response and object with data property
        const ordersData = Array.isArray(response) ? response : (response.items || []);
        
        setOrders(ordersData);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error Loading Orders",
          description: error.response?.data?.detail || "Failed to load orders. Please try again.",
          variant: "destructive",
        });
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const filteredPurchases = orders.filter((purchase) => {
    const matchesSearch =
      (purchase.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.customer_phone || "").includes(searchTerm) ||
      (purchase.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "All" || purchase.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Shipped":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "Processing":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6 hover:bg-muted"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Purchase Details
          </h1>
          <p className="text-muted-foreground">
            View and manage customer orders
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Processing", "Shipped", "Delivered"].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Processing</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((p) => p.status === "Processing").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Shipped</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter((p) => p.status === "Shipped").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((p) => p.status === "Delivered").length}
            </p>
          </Card>
        </div>

        {/* Desktop Table View */}
        <Card className="hidden md:block overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading orders...</span>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Artwork ID</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{purchase.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{purchase.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{purchase.customer_phone}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Artwork #{purchase.artwork_id}</p>
                        {purchase.message && (
                          <p className="text-xs text-muted-foreground">{purchase.message}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{purchase.customer_address}</TableCell>
                    <TableCell>{new Date(purchase.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(purchase.status || "Processing")}>
                        {purchase.status || "Processing"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading orders...</span>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            filteredPurchases.map((purchase) => (
              <Card key={purchase.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-foreground">Order #{purchase.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(purchase.status || "Processing")}>
                    {purchase.status || "Processing"}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{purchase.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{purchase.customer_phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Artwork</p>
                    <p className="font-medium">Artwork #{purchase.artwork_id}</p>
                    {purchase.message && (
                      <p className="text-xs text-muted-foreground">{purchase.message}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {purchase.customer_address}
                    </p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PurchaseDetails;

// Made with Bob
