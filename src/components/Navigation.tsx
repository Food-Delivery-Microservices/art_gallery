import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X, LogOut, UserCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import favoritesService from "@/services/favorites.service";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = getCartCount();

  // Update favorites count
  useEffect(() => {
    const updateFavoritesCount = () => {
      setFavoritesCount(favoritesService.getCount());
    };

    updateFavoritesCount();
    
    // Listen for storage changes (when favorites are updated)
    window.addEventListener('storage', updateFavoritesCount);
    
    // Also update on location change (when navigating between pages)
    updateFavoritesCount();

    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
    };
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (category: string) => {
    if (category === "Paintings" && location.pathname === "/") return true;
    if (category === "Prints" && location.pathname === "/prints") return true;
    if (category === "Art Advisory" && location.pathname === "/art-advisory") return true;
    return false;
  };

  const categories = [
    "Paintings",
    // "Photography",
    // "Sculpture",
    // "Drawings",
    "Prints",
    "Art Advisory",
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-foreground hidden sm:block">
                ArtGallery
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (category === "Paintings") {
                      navigate("/");
                    } else if (category === "Prints") {
                      navigate("/prints");
                    } else if (category === "Art Advisory") {
                      navigate("/art-advisory");
                    }
                  }}
                  className={`text-base font-bold transition-colors cursor-pointer relative ${
                    isActive(category)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                  {isActive(category) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-4 py-2 w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for art..."
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground"
              />
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => navigate("/login")}
              >
                <User className="w-5 h-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex relative"
              onClick={() => navigate("/favorites")}
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {favoritesCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex relative"
              onClick={() => navigate("/cart")}
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for art..."
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (category === "Paintings") {
                      navigate("/");
                      setIsMobileMenuOpen(false);
                    } else if (category === "Prints") {
                      navigate("/prints");
                      setIsMobileMenuOpen(false);
                    } else if (category === "Art Advisory") {
                      navigate("/art-advisory");
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`text-base font-bold transition-colors py-2 text-left w-full ${
                    isActive(category)
                      ? "text-foreground bg-muted px-3 rounded-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
              <div className="flex gap-2 pt-2">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 relative"
                  onClick={() => {
                    navigate("/favorites");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                  {favoritesCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {favoritesCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 relative"
                  onClick={() => {
                    navigate("/cart");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
