import { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { artworkApi } from "@/services/api.service";
import { useCart } from "@/context/CartContext";
import { favoritesService } from "@/services/favorites.service";
import { useToast } from "@/hooks/use-toast";

interface ArtworkItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  thumbnail_url: string;
  ts: number;
}

const ArtworkGrid = () => {
  const rupee = "₹";
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites
  useEffect(() => {
    const loadedFavorites = favoritesService.getAll();
    console.log(loadedFavorites)
    setFavorites(new Set(loadedFavorites.map((f: any) => f.id.toString())));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, artwork: ArtworkItem) => {
    e.stopPropagation();
    const isFavorited = favorites.has(artwork.id);
    
    if (isFavorited) {
      favoritesService.remove(parseInt(artwork.id));
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(artwork.id);
        return newSet;
      });
      toast({
        title: "Removed from favorites",
        description: `${artwork.title} has been removed from your favorites`,
      });
    } else {
      favoritesService.add({
        id: parseInt(artwork.id),
        title: artwork.title,
        artist: "Artist Name",
        price: `${rupee}${artwork.price.toLocaleString('en-IN')}`,
        image: artwork.thumbnail_url || artwork.image_url,
        category: "Art",
      });
      setFavorites(prev => new Set(prev).add(artwork.id));
      toast({
        title: "Added to favorites",
        description: `${artwork.title} has been added to your favorites`,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, artwork: ArtworkItem) => {
    e.stopPropagation();
    addToCart({
      id: parseInt(artwork.id),
      title: artwork.title,
      artist: "Artist Name",
      price: `${rupee}${artwork.price.toLocaleString('en-IN')}`,
      image: artwork.thumbnail_url || artwork.image_url,
      category: "Art",
    } as any);
    toast({
      title: "Added to cart",
      description: `${artwork.title} has been added to your cart`,
    });
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await artworkApi.getAll({}, { limit: 50 });
        setArtworks(response.items || []);
      } catch (err) {
        console.error("Failed to fetch artworks:", err);
        setError("Failed to load artworks");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading artworks...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground font-serif tracking-tight">
            Experience the Joy of Living with Original Art
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light tracking-wide">
            Discover unique pieces from talented artists around the world
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="group"
            >
              {/* Image Container */}
              <div
                className="relative aspect-[3/4] overflow-hidden bg-muted mb-3 border border-border/40 rounded-sm cursor-pointer"
                onClick={() => navigate(`/artwork/${artwork.id}`)}
              >
                <img
                  src={artwork.thumbnail_url || artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Action Buttons - appear on hover */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                    onClick={(e) => toggleFavorite(e, artwork)}
                  >
                    <Heart
                      className={`w-4 h-4 ${favorites.has(artwork.id) ? 'fill-current text-red-500' : 'text-gray-700'}`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md"
                    onClick={(e) => handleAddToCart(e, artwork)}
                  >
                    <ShoppingCart className="w-4 h-4 text-gray-700" />
                  </Button>
                </div>
              </div>

              {/* Artwork Details */}
              <div className="space-y-1">
                {/* Title */}
                <h3
                  className="text-base font-medium text-foreground hover:text-foreground/80 transition-colors line-clamp-1 cursor-pointer"
                  onClick={() => navigate(`/artwork/${artwork.id}`)}
                >
                  {artwork.title}
                </h3>
                
                {/* Description - subtle and minimal */}
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {artwork.description}
                </p>
                
                {/* Price */}
                <p className="text-base font-semibold text-foreground pt-1">
                  {rupee}{artwork.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          {/* <Button size="lg" variant="outline">
            Load More Artworks
          </Button> */}
        </div>
      </div>
    </section>
  );
};

export default ArtworkGrid;
