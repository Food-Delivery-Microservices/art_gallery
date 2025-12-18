import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
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

const ManageArtworks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await artworkApi.getAll({}, { limit: 100 });
        setArtworks(response.items || []);
      } catch (err) {
        console.error("Failed to fetch artworks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        // Call the delete API
        await artworkApi.delete(deleteId);
        
        // Remove from local state
        setArtworks(artworks.filter((art) => art.id !== deleteId));
        setDeleteId(null);
        
        // Show success message
        console.log('Artwork deleted successfully');
        
        // Refresh the list from API
        const response = await artworkApi.getAll({}, { limit: 100 });
        if (response.data && response.data.items) {
          setArtworks(response.data.items);
        } else if (response.items) {
          setArtworks(response.items);
        }
      } catch (error: any) {
        console.error('Failed to delete artwork:', error);
        
        // Handle error cases
        if (error.response?.status === 404) {
          alert('Artwork not found. It may have already been deleted.');
          // Remove from local state anyway
          setArtworks(artworks.filter((art) => art.id !== deleteId));
        } else {
          alert('Failed to delete artwork. Please try again.');
        }
        
        setDeleteId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading artworks...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-4 hover:bg-muted -ml-4"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Manage Artworks
            </h1>
            <p className="text-muted-foreground">
              View and manage all artworks in the gallery
            </p>
          </div>
          <Button onClick={() => navigate("/admin/upload")}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Artwork
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Artworks</p>
            <p className="text-2xl font-bold text-foreground">{artworks.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-2xl font-bold text-foreground">
              ${artworks.reduce((sum, a) => sum + a.price, 0).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <Card
              key={artwork.id}
              className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={artwork.thumbnail_url || artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/admin/edit/${artwork.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(artwork.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                  {artwork.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {artwork.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">${artwork.price}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {artworks.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No artworks found</p>
            <Button onClick={() => navigate("/admin/upload")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Artwork
            </Button>
          </Card>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the artwork
              from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageArtworks;

// Made with Bob
