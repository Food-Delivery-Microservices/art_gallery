import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Grid3x3, List, Heart, ShoppingCart, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import cacheService from "@/services/cache.service";
import { artworkApi } from "@/services/api.service";

const Prints = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [prints, setPrints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'cache' | 'api' | 'fallback'>('fallback');

  // Load prints from localStorage/API
  useEffect(() => {
    const loadPrints = async () => {
      setLoading(true);
      
      // Try to get from cache first
      let cachedData = cacheService.get('admin_art');
      
      if (!cachedData) {
        console.log('No cache, fetching from API...');
        try {
          const apiResponse = await artworkApi.getAll();
          cachedData = apiResponse;
          setDataSource('api');
        } catch (error) {
          console.error('Failed to fetch from API:', error);
        }
      } else {
        setDataSource('cache');
      }
      
      if (cachedData) {
        let artworksList = [];
        
        if (Array.isArray(cachedData)) {
          artworksList = cachedData;
        } else if (cachedData.data && cachedData.data.items && Array.isArray(cachedData.data.items)) {
          // Nested structure: data.items
          artworksList = cachedData.data.items;
        } else if (cachedData.items && Array.isArray(cachedData.items)) {
          artworksList = cachedData.items;
        } else if (cachedData.artworks && Array.isArray(cachedData.artworks)) {
          artworksList = cachedData.artworks;
        }
        
        setPrints(artworksList);
      } else {
        // Fallback to hardcoded data
        setDataSource('fallback');
        setPrints([
          {
            id: 101,
            image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop",
            title: "Abstract Waves",
            artist: "Elena Rodriguez",
            price: 2500,
            category: "Abstract",
            description: "Limited edition print on premium paper",
          },
        ]);
      }
      
      setLoading(false);
    };

    loadPrints();
  }, []);

  const categories = ["All", ...Array.from(new Set(prints.map(p => p.category).filter(Boolean)))];
  const sizes = ["All", "A2", "A3", "A4"];

  const filteredPrints = prints.filter((print) => {
    const categoryMatch = selectedCategory === "All" || print.category === selectedCategory;
    return categoryMatch;
  });

  const handleAddToCart = (print: any) => {
    const cartItem = {
      id: print.id,
      image: print.image_url || print.image || print.thumbnail_url,
      title: print.title,
      artist: print.artist || 'Unknown Artist',
      price: typeof print.price === 'number' ? `₹${print.price.toLocaleString()}` : print.price,
      category: print.category || 'Artwork',
      description: print.description || '',
      dimensions: print.dimensions || 'N/A',
      medium: "Fine Art Print",
      year: print.year || new Date().getFullYear(),
      availability: "Available",
    };
    addToCart(cartItem as any);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6 hover:bg-muted"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Gallery</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Badge variant="secondary">Limited Editions</Badge>
            {dataSource === 'cache' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Database className="w-3 h-3 mr-1" />
                From Cache
              </Badge>
            )}
            {dataSource === 'api' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Live Data
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Art Prints Collection
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {loading ? 'Loading artworks...' : `Showing ${prints.length} artworks from ${dataSource === 'cache' ? 'cached data' : dataSource === 'api' ? 'live API' : 'fallback data'}`}
          </p>
        </div>

        {/* Filters and View Toggle */}
        <div className="mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-xs text-muted-foreground self-center">Category:</span>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="text-xs"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-xs text-muted-foreground self-center">Size:</span>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSize(size)}
                          className="text-xs"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 self-start lg:self-auto">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredPrints.length} {filteredPrints.length === 1 ? "print" : "prints"}
        </div>

        {/* Prints Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {filteredPrints.map((print) => (
              <Card
                key={print.id}
                className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer"
                 onClick={() => navigate(`/artwork/${print.id}`)}
               >
                 <img
                   src={print.image_url || print.image || print.thumbnail_url}
                   alt={print.title}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 />
                 <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button
                     size="icon"
                     variant="secondary"
                     className="bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Heart className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
               <div className="p-4">
                 <div className="mb-2">
                   <Badge variant="secondary" className="text-xs">
                     {print.category || 'Artwork'}
                   </Badge>
                 </div>
                 <h3 className="text-lg font-semibold text-foreground mb-1">
                   {print.title}
                 </h3>
                 <p className="text-sm text-muted-foreground mb-1">by {print.artist || 'Unknown'}</p>
                 <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{print.description}</p>
                 <div className="flex items-center justify-between">
                   <span className="text-xl font-bold text-primary">
                     {typeof print.price === 'number' ? `₹${print.price.toLocaleString()}` : print.price}
                   </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(print);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {filteredPrints.map((print) => (
              <Card key={print.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div
                    className="w-full sm:w-48 h-64 sm:h-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted cursor-pointer"
                    onClick={() => navigate(`/artwork/${print.id}`)}
                  >
                    <img
                      src={print.image_url || print.image || print.thumbnail_url}
                      alt={print.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {print.category || 'Artwork'}
                        </Badge>
                      </div>
                      <h3
                        className="text-xl sm:text-2xl font-semibold text-foreground mb-2 cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/artwork/${print.id}`)}
                      >
                        {print.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-2">
                        by {print.artist || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {print.description}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-2xl font-bold text-primary">
                        {typeof print.price === 'number' ? `₹${print.price.toLocaleString()}` : print.price}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(print)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <section className="mt-12 sm:mt-16">
          <Card className="p-6 sm:p-8 bg-muted/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center">
              About Our Prints
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Museum Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Printed on premium archival paper using professional giclée printing
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✍️</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Limited Editions</h3>
                <p className="text-sm text-muted-foreground">
                  Each print is numbered and signed by the artist with certificate
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Safe Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Carefully packaged and shipped with tracking and insurance
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Prints;

// Made with Bob
