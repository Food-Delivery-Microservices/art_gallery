import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, ShoppingCart, Info, Ruler, Palette, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { artworks } from "@/data/artworks";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import cacheService from "@/services/cache.service";
import favoritesService from "@/services/favorites.service";
import { useToast } from "@/hooks/use-toast";
import { artworkApi } from "@/services/api.service";

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'cache' | 'static'>('static');

  // Load artwork data from cache, API, or static data
  useEffect(() => {
    const loadArtwork = async () => {
      setLoading(true);
      
      let foundArtwork = null;
      
      // First, try to get from cached API data
      let cachedData = cacheService.get('admin_art');
      console.log("cachedData", cachedData);
      
      // If no cache, fetch from /admin/art API
      if (!cachedData) {
        console.log('No cache found, fetching from /admin/art API...');
        try {
          const apiResponse = await artworkApi.getAll();
          cachedData = apiResponse;
          console.log('✅ Fetched and cached data from API');
        } catch (error) {
          console.error('Failed to fetch from API:', error);
        }
      } else {
        console.log('✅ Cache found');
      }
      
      if (cachedData) {
        // Try different possible data structures
        let artworksList = null;
        
        if (Array.isArray(cachedData)) {
          artworksList = cachedData;
        } else if (cachedData.data && cachedData.data.items && Array.isArray(cachedData.data.items)) {
          // Nested structure: data.items
          artworksList = cachedData.data.items;
        } else if (cachedData.items && Array.isArray(cachedData.items)) {
          artworksList = cachedData.items;
        } else if (cachedData.artworks && Array.isArray(cachedData.artworks)) {
          artworksList = cachedData.artworks;
        } else if (cachedData.data && Array.isArray(cachedData.data)) {
          artworksList = cachedData.data;
        } else if (cachedData.results && Array.isArray(cachedData.results)) {
          artworksList = cachedData.results;
        }
        
        console.log("artworksList", artworksList);
        
        if (artworksList) {
          foundArtwork = artworksList.find((art: any) =>
            String(art.id) === String(id)
          );
          
          if (foundArtwork) {
            setArtwork(foundArtwork);
            setDataSource('cache');
            console.log('✅ Loaded artwork:', foundArtwork.title || foundArtwork.name);
            setLoading(false);
            return;
          }
        }
      }
      
      // Fallback to static data if not found in cache or API
      if (!foundArtwork) {
        const staticArtwork = artworks.find((art) => String(art.id) === String(id));
        if (staticArtwork) {
          setArtwork(staticArtwork);
          setDataSource('static');
          console.log('Loaded artwork from static data:', staticArtwork.title);
        } else {
          console.log('❌ Artwork not found with ID:', id);
        }
      }
      
      setLoading(false);
    };

    loadArtwork();
  }, [id]);

  // Check if artwork is in favorites on mount
  useEffect(() => {
    if (artwork) {
      setIsFavorite(favoritesService.isFavorite(artwork.id));
    }
  }, [artwork]);

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    console.log("clciked")
    console.log("artwork",artwork)
    if (!artwork) return;
    
    const newFavoriteStatus = favoritesService.toggle({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      price: artwork.price,
      image: artwork.image_url,
      category: artwork.category,
    });

    setIsFavorite(newFavoriteStatus);

    toast({
      title: newFavoriteStatus ? "Added to Favorites" : "Removed from Favorites",
      description: newFavoriteStatus
        ? `${artwork.title} has been added to your favorites.`
        : `${artwork.title} has been removed from your favorites.`,
      duration: 2000,
    });
  };

  const handleAddToCart = () => {
    if (artwork) {
      // Ensure artwork has all required fields for cart
      const cartItem = {
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist || 'Unknown Artist',
        price: typeof artwork.price === 'number' ? `₹${artwork.price.toLocaleString()}` : artwork.price,
        image: artwork.image_url || artwork.image || artwork.thumbnail_url,
        category: artwork.category || 'Artwork',
        description: artwork.description || '',
        dimensions: artwork.dimensions || 'N/A',
        medium: artwork.medium || 'Mixed Media',
        year: artwork.year || new Date().getFullYear(),
        availability: artwork.availability || 'Available',
      };
      console.log('cartItem',cartItem)
      addToCart(cartItem as any);
      setIsAddedToCart(true);
      toast({
        title: "Added to Cart",
        description: `${artwork.title} has been added to your cart.`,
        duration: 2000,
      });
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  // Loading state
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

  // Not found state
  if (!artwork) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Artwork Not Found</h1>
          <Button onClick={() => navigate("/")}>Return to Gallery</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button and Data Source Badge */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            className="hover:bg-muted"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Gallery</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          {dataSource === 'cache' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Loaded from Cache
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-border">
              <div className="relative aspect-[3/4] bg-muted">
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg"
                    onClick={handleToggleFavorite}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isFavorite ? "fill-red-500 text-red-500 scale-110" : ""
                      }`}
                    />
                  </Button>
                  {/* <Button
                    size="icon"
                    variant="secondary"
                    className="bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button> */}
                </div>
              </div>
            </Card>

            {/* Additional Info Card */}
            <Card className="p-3 sm:p-4 bg-muted/50">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Authenticity Guaranteed</p>
                  <p>All artworks come with a certificate of authenticity and are carefully packaged for safe delivery.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title and Artist */}
            <div>
              <Badge variant="secondary" className="mb-2 sm:mb-3 text-xs sm:text-sm">
                {artwork.category}
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {artwork.title}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                by <span className="font-semibold text-foreground">{artwork.artist}</span>
              </p>
            </div>

            <Separator />

            {/* Price and Availability */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{artwork.price}</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm self-start sm:self-auto">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                {artwork.availability}
              </Badge>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">About This Artwork</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {artwork.description}
              </p>
            </div>

            <Separator />

            {/* Specifications */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Dimensions</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{artwork.dimensions}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Medium</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{artwork.medium}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Year</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{artwork.year}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
              <Button
                size="lg"
                className="w-full text-base sm:text-lg h-11 sm:h-12"
                onClick={handleAddToCart}
                disabled={isAddedToCart}
              >
                {isAddedToCart ? (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full text-base sm:text-lg h-11 sm:h-12"
              >
                Contact Artist
              </Button>
            </div>

            {/* Shipping Info */}
            <Card className="p-3 sm:p-4 bg-muted/30 border-dashed">
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Free Shipping</span> on orders over ₹10,000.
                Estimated delivery: 5-7 business days.
              </p>
            </Card>
          </div>
        </div>

        {/* Related Artworks Section */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground">More from this Artist</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {artworks
              .filter((art) => art.artist === artwork.artist && art.id !== artwork.id)
              .slice(0, 4)
              .map((relatedArt) => (
                <Card
                  key={relatedArt.id}
                  className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/artwork/${relatedArt.id}`)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={relatedArt.image}
                      alt={relatedArt.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-1 truncate">
                      {relatedArt.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {relatedArt.category}
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-primary">{relatedArt.price}</p>
                  </div>
                </Card>
              ))}
          </div>
          {artworks.filter((art) => art.artist === artwork.artist && art.id !== artwork.id).length === 0 && (
            <p className="text-center text-muted-foreground py-8">No other artworks from this artist available.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ArtworkDetail;

// Made with Bob
