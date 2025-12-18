import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { cacheService } from "@/services/cache.service";
import { artworkApi } from "@/services/api.service";
import type { Artwork } from "@/types/api.types";

const EditArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    price: "",
    category: "",
    description: "",
    dimensions: "",
    medium: "",
    year: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // Load artwork data from cache or API
  useEffect(() => {
    const loadArtwork = async () => {
      try {
        setLoading(true);
        
        // Try to get from cache first
        const cachedData = cacheService.get('admin_art');
        let artworkData: Artwork | undefined;

        if (cachedData) {
          // Check nested structure
          const items = cachedData.data?.items || cachedData.items || [];
          artworkData = items.find((art: Artwork) => String(art.id) === String(id));
          if (artworkData) {
            console.log('Loaded artwork from cache');
          }
        }

        // If not in cache, fetch from API
        if (!artworkData) {
          const response = await artworkApi.getAll({}, { limit: 100 });
          const items = response.data?.items || response.items || [];
          artworkData = items.find((art: Artwork) => String(art.id) === String(id));
          console.log('Loaded artwork from API');
        }

        if (artworkData) {
          setArtwork(artworkData);
          setFormData({
            title: artworkData.title || "",
            artist: artworkData.artist || "",
            price: String(artworkData.price || ""),
            category: artworkData.category || "",
            description: artworkData.description || "",
            dimensions: artworkData.dimensions || "",
            medium: artworkData.medium || "",
            year: String(artworkData.year || ""),
          });
          setImagePreview(artworkData.image_url || artworkData.thumbnail_url || "");
        }
      } catch (error) {
        console.error('Error loading artwork:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadArtwork();
    }
  }, [id]);

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading artwork...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Artwork Not Found</h1>
          <Button onClick={() => navigate("/admin/artworks")}>
            Back to Artworks
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Call the update API
      await artworkApi.update(Number(id), {
        id: Number(id),
        title: formData.title,
        artist: formData.artist,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        dimensions: formData.dimensions,
        medium: formData.medium,
        year: Number(formData.year),
      });

      setIsSaving(false);
      setSaveSuccess(true);
      
      // Clear cache to force refresh
      cacheService.remove('admin_art');
      
      setTimeout(() => {
        navigate("/admin/artworks");
      }, 1500);
    } catch (error) {
      console.error('Error updating artwork:', error);
      setIsSaving(false);
      alert('Failed to update artwork. Please try again.');
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
          onClick={() => navigate("/admin/artworks")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Artworks
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Edit Artwork
            </h1>
            <p className="text-muted-foreground">
              Update artwork information
            </p>
          </div>

          {saveSuccess && (
            <Card className="p-4 mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <p className="text-green-900 dark:text-green-100 font-medium">
                ✓ Artwork updated successfully! Redirecting...
              </p>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Section */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Artwork Image
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute bottom-2 right-2 cursor-pointer">
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3">
                          Change Image
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Form Fields Section */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">
                    Artwork Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Title *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Artist *
                        </label>
                        <Input
                          value={formData.artist}
                          onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Price (₹) *
                        </label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select category</option>
                          <option value="Abstract">Abstract</option>
                          <option value="Landscape">Landscape</option>
                          <option value="Figurative">Figurative</option>
                          <option value="Expressionism">Expressionism</option>
                          <option value="Flowers">Flowers</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description *
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Dimensions *
                        </label>
                        <Input
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Medium *
                        </label>
                        <Input
                          value={formData.medium}
                          onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Year *
                        </label>
                        <Input
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/artworks")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditArtwork;

// Made with Bob
