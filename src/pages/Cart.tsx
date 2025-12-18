import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Mail, X, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import cacheService from "@/services/cache.service";
import { orderApi } from "@/services/api.service";
import type { OrderCreate } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showCustomerDetailsDialog, setShowCustomerDetailsDialog] = useState(false);
  const [hasCache, setHasCache] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });
  const { toast } = useToast();

  // Check if we have cached data
  useEffect(() => {
    const cachedData = cacheService.get('admin_art');
    setHasCache(!!cachedData);
  }, []);

  const handleOpenCustomerDetails = () => {
    setShowCheckoutDialog(false);
    setShowCustomerDetailsDialog(true);
  };

  const handleSubmitOrder = async () => {
    // Validate customer details
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required customer details",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const results: any[] = [];
      const failedOrders: Array<{ item: any; error: any }> = [];

      // Process orders sequentially (one at a time) to avoid API conflicts
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        
        try {
          const orderData: OrderCreate = {
            artwork_id: String(item.id),
            customer_name: customerDetails.name,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone,
            customer_address: customerDetails.address,
            message: customerDetails.message || undefined,
          };

          // Send order and wait for completion before proceeding to next
          const result = await orderApi.createOrder(orderData);
          results.push(result);
          
          // Show progress toast for each successful order
          toast({
            title: `Order ${i + 1}/${cartItems.length} Submitted`,
            description: `${item.title} order placed successfully`,
            variant: "default",
          });

          // Small delay between orders to prevent API overload (optional but recommended)
          if (i < cartItems.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          console.error(`Error submitting order for ${item.title}:`, error);
          failedOrders.push({ item, error });
        }
      }

      // Show final result
      if (failedOrders.length === 0) {
        toast({
          title: "All Orders Submitted Successfully!",
          description: `${results.length} order(s) have been placed. We'll contact you soon.`,
          variant: "default",
        });

        // Clear cart and close dialogs
        clearCart();
        setShowCustomerDetailsDialog(false);
        setCustomerDetails({ name: "", email: "", phone: "", address: "", message: "" });

        // Navigate to home page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Some orders failed
        toast({
          title: "Partial Order Submission",
          description: `${results.length} order(s) succeeded, ${failedOrders.length} failed. Please try again for failed items.`,
          variant: "destructive",
        });
        
        // Remove successfully ordered items from cart
        results.forEach((_, index) => {
          if (index < cartItems.length && !failedOrders.some(f => f.item.id === cartItems[index].id)) {
            removeFromCart(cartItems[index].id);
          }
        });
      }

    } catch (error: any) {
      console.error("Error submitting orders:", error);
      toast({
        title: "Order Submission Failed",
        description: error.response?.data?.detail || "Failed to submit orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-foreground">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any artworks to your cart yet.
            </p>
            <Button size="lg" onClick={() => navigate("/")}>
              Browse Artworks
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-muted"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Shopping Cart ({getCartCount()} {getCartCount() === 1 ? "item" : "items"})
                </h1>
                {hasCache && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Database className="w-3 h-3 mr-1" />
                    Cached
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 self-start sm:self-auto"
              >
                Clear Cart
              </Button>
            </div>

            {cartItems.map((item) => (
              <Card key={item.id} className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Image */}
                  <div
                    className="w-full sm:w-24 md:w-32 h-48 sm:h-24 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted cursor-pointer"
                    onClick={() => navigate(`/artwork/${item.id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3
                          className="text-base sm:text-lg font-semibold text-foreground cursor-pointer hover:text-primary truncate"
                          onClick={() => navigate(`/artwork/${item.id}`)}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">by {item.artist}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-bold text-primary">{item.price}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {item.price} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6 sticky top-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Order Summary</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
                  <span>Subtotal ({getCartCount()} items)</span>
                  <span>{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
                  <span>Tax (estimated)</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                <span>Total</span>
                <span className="text-primary">{getCartTotal()}</span>
              </div>

              <Button
                size="lg"
                className="w-full mb-3"
                onClick={() => setShowCheckoutDialog(true)}
              >
                Proceed to Checkout
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </Button>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Secure Checkout:</span> Your payment information is encrypted and secure.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Email Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Mail className="w-6 h-6 text-blue-500" />
              Complete Your Order
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Your order will be sent via email for confirmation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Order Summary */}
            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.title} x {item.quantity}
                    </span>
                    <span className="font-medium">{item.price}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{getCartTotal()}</span>
                </div>
              </div>
            </Card>

            {/* Email Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Email Order Process
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Clicking "Send Order" will open your email client with your order details.
                  Our team will confirm your order and provide payment instructions.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCheckoutDialog(false)}
                className="flex-1 order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOpenCustomerDetails}
                className="flex-1 bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Order via Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetailsDialog} onOpenChange={setShowCustomerDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Customer Details</DialogTitle>
            <DialogDescription>
              Please provide your details to complete the order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Full Name *
              </label>
              <Input
                placeholder="Enter your full name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Delivery Address *
              </label>
              <Textarea
                placeholder="Enter your complete delivery address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Additional Message (Optional)
              </label>
              <Textarea
                placeholder="Any special instructions or notes"
                value={customerDetails.message}
                onChange={(e) => setCustomerDetails({ ...customerDetails, message: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomerDetailsDialog(false);
                setShowCheckoutDialog(true);
              }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitOrder}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Submit Order
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;

// Made with Bob
