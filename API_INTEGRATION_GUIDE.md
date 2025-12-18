# API Integration Guide

This guide explains how to integrate your React frontend with the backend API running at `http://127.0.0.1:8000`.

## 📁 Project Structure

```
src/
├── services/
│   └── api.service.ts          # Main API service with all endpoints
├── types/
│   └── api.types.ts            # TypeScript types for API requests/responses
├── hooks/
│   └── useApi.ts               # Custom hooks for API calls
└── .env                        # Environment variables
```

## 🔧 Setup

### 1. Environment Variables

The `.env` file is already configured:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_APP_ENV=development
```

**Note:** Vite requires environment variables to be prefixed with `VITE_`.

### 2. Dependencies

Axios is already installed. If you need to reinstall:

```bash
npm install axios
```

## 📚 API Service Usage

### Import the API Service

```typescript
import api from '@/services/api.service';
// Or import specific modules
import { artworkApi, authApi, orderApi, userApi } from '@/services/api.service';
```

### Available API Modules

1. **artworkApi** - Artwork CRUD operations
2. **authApi** - Authentication
3. **userApi** - User profile management
4. **orderApi** - Order management
5. **apiUtils** - Utility functions

## 🎨 Artwork API Examples

### Get All Artworks

```typescript
import { artworkApi } from '@/services/api.service';

// Basic usage
const response = await artworkApi.getAll();
console.log(response.data); // Array of artworks

// With filters and pagination
const response = await artworkApi.getAll(
  { category: 'Abstract', minPrice: 1000, maxPrice: 5000 },
  { page: 1, limit: 10 }
);
```

### Get Single Artwork

```typescript
const response = await artworkApi.getById(1);
console.log(response.data); // Single artwork object
```

### Create Artwork

```typescript
const newArtwork = {
  title: 'Sunset Dreams',
  artist: 'Jane Doe',
  price: 2500,
  category: 'Abstract',
  image: imageFile, // File object from input
  description: 'Beautiful abstract painting',
  dimensions: '24x36 inches',
  medium: 'Oil on Canvas',
  year: 2024,
  featured: true,
};

const response = await artworkApi.create(newArtwork);
```

### Update Artwork

```typescript
const updates = {
  title: 'Updated Title',
  price: 3000,
  // Only include fields you want to update
};

const response = await artworkApi.update(artworkId, updates);
```

### Delete Artwork

```typescript
const response = await artworkApi.delete(artworkId);
```

### Get Artwork Statistics

```typescript
const response = await artworkApi.getStats();
console.log(response.data); // { total, byCategory, totalValue, averagePrice }
```

## 🔐 Authentication API Examples

### Login

```typescript
import { authApi } from '@/services/api.service';

const response = await authApi.login({
  username: 'admin',
  password: 'admin123',
});

// Token is automatically stored in localStorage
console.log(response.data.user);
console.log(response.data.token);
```

### Logout

```typescript
await authApi.logout();
// Token is automatically removed from localStorage
```

### Get Current User

```typescript
const response = await authApi.getCurrentUser();
console.log(response.data); // Current user object
```

### Register

```typescript
const response = await authApi.register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123',
});
```

## 👤 User API Examples

### Update Profile

```typescript
import { userApi } from '@/services/api.service';

const response = await userApi.updateProfile({
  username: 'newusername',
  email: 'newemail@example.com',
});
```

### Change Password

```typescript
const response = await userApi.changePassword(
  'currentPassword',
  'newPassword'
);
```

## 🛒 Order API Examples

### Get All Orders (Admin)

```typescript
import { orderApi } from '@/services/api.service';

const response = await orderApi.getAll({ page: 1, limit: 20 });
console.log(response.data); // Array of orders
console.log(response.pagination); // Pagination info
```

### Create Order

```typescript
const newOrder = {
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+1234567890',
  items: [
    { artworkId: 1, quantity: 1 },
    { artworkId: 2, quantity: 2 },
  ],
  shippingAddress: '123 Main St, City, Country',
  paymentMethod: 'Credit Card',
};

const response = await orderApi.create(newOrder);
```

### Update Order Status

```typescript
const response = await orderApi.updateStatus(orderId, 'completed');
```

### Get Order Statistics

```typescript
const response = await orderApi.getStats();
console.log(response.data); // { total, totalRevenue, byStatus, recentOrders }
```

### Search Orders

```typescript
const response = await orderApi.search('john@example.com');
```

## 🎣 Using Custom Hooks

### useApi Hook

For manual API calls with loading and error states:

```typescript
import { useApi } from '@/hooks/useApi';
import { artworkApi } from '@/services/api.service';

function MyComponent() {
  const { data, loading, error, execute } = useApi(artworkApi.getAll);

  const handleFetch = async () => {
    const result = await execute({ category: 'Abstract' }, { page: 1, limit: 10 });
    if (result) {
      console.log('Success:', result);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={handleFetch}>Fetch Artworks</button>
    </div>
  );
}
```

### useApiOnMount Hook

For automatic API calls on component mount:

```typescript
import { useApiOnMount } from '@/hooks/useApi';
import { artworkApi } from '@/services/api.service';

function MyComponent() {
  const { data, loading, error, refetch } = useApiOnMount(
    artworkApi.getAll,
    [{ category: 'Abstract' }, { page: 1, limit: 10 }]
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## 🔄 Example: Updating a Component to Use API

### Before (Using Mock Data)

```typescript
import { artworks } from '@/data/artworks';

function ArtworkGrid() {
  const [artworks, setArtworks] = useState(mockArtworks);
  
  return (
    <div>
      {artworks.map(artwork => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
```

### After (Using API)

```typescript
import { useEffect, useState } from 'react';
import { artworkApi } from '@/services/api.service';
import type { Artwork } from '@/types/api.types';

function ArtworkGrid() {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {artworks.map(artwork => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
```

### Or Using Custom Hook

```typescript
import { useApiOnMount } from '@/hooks/useApi';
import { artworkApi } from '@/services/api.service';

function ArtworkGrid() {
  const { data, loading, error, refetch } = useApiOnMount(artworkApi.getAll);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {data?.data.map(artwork => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
```

## 🔒 Authentication Flow

The API service automatically handles authentication:

1. **Login**: Token is stored in `localStorage` automatically
2. **Requests**: Token is added to all requests via interceptor
3. **401 Response**: User is redirected to login page automatically
4. **Logout**: Token is removed from `localStorage`

## 📝 TypeScript Types

All API types are defined in `src/types/api.types.ts`:

- `Artwork` - Artwork object
- `User` - User object
- `Order` - Order object
- `ApiResponse<T>` - Standard API response
- `PaginatedResponse<T>` - Paginated response
- And many more...

## 🚨 Error Handling

The API service includes global error handling:

- **401 Unauthorized**: Auto-redirect to login
- **403 Forbidden**: Console error
- **404 Not Found**: Console error
- **500+ Server Error**: Console error
- **Network Error**: Console error

You can also handle errors in your components:

```typescript
try {
  const response = await artworkApi.getById(id);
  // Handle success
} catch (error) {
  // Handle error
  console.error('Failed to fetch artwork:', error);
}
```

## 🔧 Backend API Endpoints Expected

Your backend should implement these endpoints:

### Artworks
- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/:id` - Get single artwork
- `POST /api/artworks` - Create artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork
- `GET /api/artworks/stats` - Get statistics
- `GET /api/artworks/featured` - Get featured artworks

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register

### Users
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/stats` - Get statistics
- `GET /api/orders/search` - Search orders

### Utilities
- `POST /api/upload/image` - Upload image
- `GET /api/health` - Health check

## 📦 Response Format

All API responses should follow this format:

```typescript
// Success Response
{
  "success": true,
  "data": { /* your data */ },
  "message": "Optional success message"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "message": "Optional detailed message"
}

// Paginated Response
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🎯 Next Steps

1. **Start your backend server** at `http://127.0.0.1:8000`
2. **Test the connection** using the health check endpoint
3. **Update components** one by one to use the API service
4. **Test each feature** thoroughly
5. **Handle edge cases** and errors appropriately

## 💡 Tips

- Always handle loading and error states
- Use TypeScript types for type safety
- Test API calls with your backend before integrating
- Use the custom hooks for cleaner code
- Check browser console for detailed error messages
- Use browser DevTools Network tab to debug API calls

## 🐛 Troubleshooting

### CORS Issues
If you get CORS errors, ensure your backend allows requests from `http://localhost:5173` (or your Vite dev server port).

### 401 Errors
Check that your backend is sending the correct token format and that the token is being stored in localStorage.

### Network Errors
Verify that your backend is running at `http://127.0.0.1:8000` and is accessible.

### Type Errors
Ensure your backend response format matches the TypeScript types defined in `api.types.ts`.

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the Network tab in DevTools
3. Verify your backend is running and accessible
4. Ensure response formats match the expected types