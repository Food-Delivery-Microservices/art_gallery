/**
 * API Integration Examples
 * 
 * This file demonstrates how to use the API service in your components.
 * Copy these patterns to integrate API calls into your existing components.
 */

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { artworkApi, authApi, orderApi } from '@/services/api.service';
import type { Artwork, Order } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ============================================
// Example 1: Fetch Artworks on Component Mount
// ============================================
export function ArtworkListExample() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await artworkApi.getAll();
        setArtworks(response.data);
      } catch (err) {
        setError('Failed to fetch artworks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  if (loading) return <div>Loading artworks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Artworks ({artworks.length})</h2>
      {artworks.map((artwork) => (
        <div key={artwork.id}>
          <h3>{artwork.title}</h3>
          <p>by {artwork.artist}</p>
          <p>${artwork.price}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Example 2: Using Custom Hook (Recommended)
// ============================================
export function ArtworkListWithHook() {
  const { data, loading, error, execute } = useApi(artworkApi.getAll);
  const [filters, setFilters] = useState({ category: '' });

  useEffect(() => {
    execute(filters);
  }, [filters]);

  const handleFilterChange = (category: string) => {
    setFilters({ category });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <select onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Abstract">Abstract</option>
        <option value="Landscape">Landscape</option>
        <option value="Portrait">Portrait</option>
      </select>

      {data?.data.map((artwork) => (
        <div key={artwork.id}>
          <h3>{artwork.title}</h3>
          <p>{artwork.category}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Example 3: Create/Update Artwork
// ============================================
export function CreateArtworkExample() {
  const { toast } = useToast();
  const { loading, error, execute } = useApi(artworkApi.create);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    price: 0,
    category: 'Abstract',
    description: '',
    dimensions: '',
    medium: '',
    year: new Date().getFullYear(),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast({
        title: 'Error',
        description: 'Please select an image',
        variant: 'destructive',
      });
      return;
    }

    const result = await execute({
      ...formData,
      image: imageFile,
    });

    if (result) {
      toast({
        title: 'Success',
        description: 'Artwork created successfully',
      });
      // Reset form or redirect
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Artist"
        value={formData.artist}
        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />
      
      {error && <p className="text-red-500">{error}</p>}
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Artwork'}
      </Button>
    </form>
  );
}

// ============================================
// Example 4: Update Artwork
// ============================================
export function UpdateArtworkExample({ artworkId }: { artworkId: number }) {
  const { toast } = useToast();
  const { loading, execute } = useApi(artworkApi.update);
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    // Fetch artwork details
    const fetchArtwork = async () => {
      const response = await artworkApi.getById(artworkId);
      setArtwork(response.data);
    };
    fetchArtwork();
  }, [artworkId]);

  const handleUpdate = async () => {
    if (!artwork) return;

    const result = await execute(artworkId, {
      title: artwork.title,
      price: artwork.price,
      // Include only fields you want to update
    });

    if (result) {
      toast({
        title: 'Success',
        description: 'Artwork updated successfully',
      });
    }
  };

  if (!artwork) return <div>Loading...</div>;

  return (
    <div>
      <input
        type="text"
        value={artwork.title}
        onChange={(e) => setArtwork({ ...artwork, title: e.target.value })}
      />
      <input
        type="number"
        value={artwork.price}
        onChange={(e) => setArtwork({ ...artwork, price: Number(e.target.value) })}
      />
      <Button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update Artwork'}
      </Button>
    </div>
  );
}

// ============================================
// Example 5: Delete Artwork
// ============================================
export function DeleteArtworkExample({ artworkId }: { artworkId: number }) {
  const { toast } = useToast();
  const { loading, execute } = useApi(artworkApi.delete);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    const result = await execute(artworkId);

    if (result) {
      toast({
        title: 'Success',
        description: 'Artwork deleted successfully',
      });
      // Refresh list or redirect
    }
  };

  return (
    <Button onClick={handleDelete} disabled={loading} variant="destructive">
      {loading ? 'Deleting...' : 'Delete Artwork'}
    </Button>
  );
}

// ============================================
// Example 6: Login
// ============================================
export function LoginExample() {
  const { toast } = useToast();
  const { loading, error, execute } = useApi(authApi.login);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await execute(credentials);

    if (result) {
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      // Redirect to dashboard
      window.location.href = '/profile';
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
      />
      
      {error && <p className="text-red-500">{error}</p>}
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}

// ============================================
// Example 7: Fetch Orders with Pagination
// ============================================
export function OrderListExample() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await orderApi.getAll({ page, limit: 10 });
        setOrders(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  return (
    <div>
      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <>
          {orders.map((order) => (
            <div key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Customer: {order.customerName}</p>
              <p>Total: ${order.totalAmount}</p>
              <p>Status: {order.status}</p>
            </div>
          ))}

          <div>
            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Example 8: Search Functionality
// ============================================
export function SearchArtworksExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await artworkApi.getAll({ search: searchTerm });
      setResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search artworks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <Button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </Button>

      <div>
        {results.map((artwork) => (
          <div key={artwork.id}>
            <h3>{artwork.title}</h3>
            <p>by {artwork.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 9: Error Handling
// ============================================
export function ErrorHandlingExample() {
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchArtwork = async (id: number) => {
    setLoading(true);
    try {
      const response = await artworkApi.getById(id);
      setArtwork(response.data);
      
      toast({
        title: 'Success',
        description: 'Artwork loaded successfully',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch artwork';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={() => fetchArtwork(1)} disabled={loading}>
        Load Artwork
      </Button>
      {artwork && (
        <div>
          <h2>{artwork.title}</h2>
          <p>{artwork.description}</p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
