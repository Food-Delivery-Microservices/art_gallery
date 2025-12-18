import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { artworkApi } from "@/services/api.service";

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
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <Card
              key={artwork.id}
              className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/artwork/${artwork.id}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={artwork.thumbnail_url || artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {artwork.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {artwork.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{rupee}{artwork.price}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/artwork/${artwork.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Load More Artworks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArtworkGrid;
