import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import favoritesService from "@/services/favorites.service";
import type { FavoriteArtwork } from "@/services/favorites.service";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const Favorites = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteArtwork[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    const allFavorites = favoritesService.getAll();
    console.log('allFavorites',allFavorites)
    setFavorites(allFavorites);
    setLoading(false);
  };

  const handleRemoveFavorite = (artworkId: number, title: string) => {
    favoritesService.remove(artworkId);
    loadFavorites();
    
    toast({
      title: "Removed from Favorites",
      description: `${title} has been removed from your favorites.`,
      duration: 2000,
    });
  };

  const handleAddToCart = (artwork: FavoriteArtwork) => {
    addToCart({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      price: artwork.price,
      image: artwork.image,
      category: artwork.category,
    } as any);

    toast({
      title: "Added to Cart",
      description: `${artwork.title} has been added to your cart.`,
      duration: 2000,
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all favorites?")) {
      favoritesService.clear();
      loadFavorites();
      
      toast({
        title: "Favorites Cleared",
        description: "All favorites have been removed.",
        duration: 2000,
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 hover:bg-muted"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                My Favorites
              </h1>
              <p className="text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? 'artwork' : 'artworks'} saved
              </p>
            </div>

            {favorites.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding artworks to your favorites to see them here
            </p>
            <Button onClick={() => navigate("/")}>
              Browse Gallery
            </Button>
          </Card>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((artwork) => (
              <Card
                key={artwork.id}
                className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer"
                  onClick={() => navigate(`/artwork/${artwork.id}`)}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(artwork.id, artwork.title);
                    }}
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </Button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {artwork.category}
                    </Badge>
                    <h3
                      className="text-lg font-semibold text-foreground mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                    >
                      {artwork.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {artwork.artist}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">
                      {typeof artwork.price === 'number' 
                        ? `₹${artwork.price.toLocaleString()}`
                        : artwork.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(artwork.addedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(artwork)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        {favorites.length > 0 && (
          <Card className="mt-8 p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">💡 Tip:</span> Your favorites are
              stored locally in your browser. Click the heart icon on any artwork detail page to
              add or remove it from favorites.
            </p>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;

// Made with Bob
