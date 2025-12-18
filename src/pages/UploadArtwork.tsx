import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { artworkApi } from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";

const UploadArtwork = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    price: "",
    category: "",
    description: "",
    dimensions: "",
    medium: "",
    year: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Prepare data for API
      const uploadData = {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: formData.image,
        category: formData.category,
        artist: formData.artist || undefined,
        dimensions: formData.dimensions || undefined,
        medium: formData.medium || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
      };

      // Upload artwork using the API
      await artworkApi.create(uploadData);
      
      setIsUploading(false);
      setUploadSuccess(true);
      
      toast({
        title: "Success",
        description: "Artwork uploaded successfully!",
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setFormData({
          title: "",
          artist: "",
          price: "",
          category: "",
          description: "",
          dimensions: "",
          medium: "",
          year: "",
          image: null,
        });
        setImagePreview("");
      }, 2000);
    } catch (error: any) {
      setIsUploading(false);
      console.error("Upload error:", error);
      
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload artwork. Please try again.",
        variant: "destructive",
      });
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
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Upload Artwork
            </h1>
            <p className="text-muted-foreground">
              Add new artwork to the gallery
            </p>
          </div>

          {uploadSuccess && (
            <Card className="p-6 mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Artwork Uploaded Successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    The artwork has been added to the gallery.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Upload Section */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Artwork Image
                  </h2>
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, image: null });
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Click to upload image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 10MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
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
                          placeholder="Artwork title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Artist
                        </label>
                        <Input
                          value={formData.artist}
                          onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                          placeholder="Artist name"
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
                          placeholder="12000"
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
                        placeholder="Describe the artwork..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Dimensions
                        </label>
                        <Input
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          placeholder="24 x 36 inches"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Medium
                        </label>
                        <Input
                          value={formData.medium}
                          onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                          placeholder="Oil on Canvas"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Year
                        </label>
                        <Input
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          "Uploading..."
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Artwork
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/profile")}
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

export default UploadArtwork;

// Made with Bob
