import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import ArtworkDetail from "./pages/ArtworkDetail";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import ArtAdvisory from "./pages/ArtAdvisory";
import Prints from "./pages/Prints";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PurchaseDetails from "./pages/PurchaseDetails";
import UploadArtwork from "./pages/UploadArtwork";
import EditArtwork from "./pages/EditArtwork";
import ManageArtworks from "./pages/ManageArtworks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/art_gallery">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/artwork/:id" element={<ArtworkDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/art-advisory" element={<ArtAdvisory />} />
              <Route path="/prints" element={<Prints />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/purchases" element={<PurchaseDetails />} />
              <Route path="/admin/upload" element={<UploadArtwork />} />
              <Route path="/admin/artworks" element={<ManageArtworks />} />
              <Route path="/admin/edit/:id" element={<EditArtwork />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
