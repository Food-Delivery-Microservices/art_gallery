import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import artwork1 from "@/assets/artwork-1.jpg";
import artwork2 from "@/assets/artwork-2.jpg";
import artwork3 from "@/assets/artwork-3.jpg";
import artwork4 from "@/assets/artwork-4.jpg";
import artwork5 from "@/assets/artwork-5.jpg";
import artwork6 from "@/assets/artwork-6.jpg";

const artworks = [
  {
    id: 1,
    image: artwork1,
    title: "Abstract Harmony",
    artist: "Elena Rodriguez",
    price:  "\u20B9" + "12,200",
    category: "Abstract",
  },
  {
    id: 2,
    image: artwork2,
    title: "Mountain Dreams",
    artist: "David Chen",
    price:  "\u20B9" + "13000",
    category: "Landscape",
  },
  {
    id: 3,
    image: artwork3,
    title: "Contemporary Portrait",
    artist: "Sarah Mitchell",
    price:  "\u20B9" + "14200",
    category: "Figurative",
  },
  {
    id: 4,
    image: artwork4,
    title: "Urban Expression",
    artist: "Marcus Johnson",
    price:  "\u20B9" + "15600",
    category: "Expressionism",
  },
  {
    id: 5,
    image: artwork5,
    title: "Floral Symphony",
    artist: "Isabella Romano",
    price:  "\u20B9" + "18900",
    category: "Flowers",
  },
  {
    id: 6,
    image: artwork6,
    title: "Geometric Serenity",
    artist: "Alex Turner",
    price:  "\u20B9" + "17800",
    category: "Abstract",
  },
];

const ArtworkGrid = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Experience the Joy of Living with Original Art
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover unique pieces from talented artists around the world
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <Card
              key={artwork.id}
              className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={artwork.image}
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
                <div className="mb-2">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {artwork.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {artwork.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">by {artwork.artist}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{artwork.price}</span>
                  <Button size="sm" variant="outline">
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
