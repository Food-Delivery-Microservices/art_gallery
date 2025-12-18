import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Artwork,
  CreateArtworkDto,
  UpdateArtworkDto,
  LoginCredentials,
  AuthResponse,
  User,
  UpdateProfileDto,
  Order,
  CreateOrderDto,
  OrderCreate,
  OrderResponse,
  ArtworkFilters,
  PaginationParams,
  ArtworkStats,
  OrderStats,
} from '../types/api.types';
import cacheService from './cache.service';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and ETag to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add If-None-Match header for ETag caching on /admin/art endpoint
    if (config.url === '/admin/art' && config.method === 'get') {
      const etag = cacheService.getIfNoneMatch();
      if (etag && config.headers) {
        config.headers['If-None-Match'] = etag;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally and cache ETag responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle ETag caching for /admin/art endpoint
    if (response.config.url === '/admin/art' && response.config.method === 'get') {
      const etag = response.headers['etag'];
      if (etag && response.data) {
        // Store the response data and ETag in cache
        cacheService.set('admin_art', response.data, etag);
        console.log('Cached /admin/art response with ETag:', etag);
      }
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 304 Not Modified - return cached data
    if (error.response?.status === 304 && error.config?.url === '/admin/art') {
      console.log('304 Not Modified - returning cached data');
      const cachedData = cacheService.get('admin_art');
      if (cachedData) {
        // Return a mock response with cached data
        return Promise.resolve({
          data: cachedData,
          status: 304,
          statusText: 'Not Modified',
          headers: error.response.headers,
          config: error.config,
        } as AxiosResponse);
      }
    }
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Access forbidden');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response from server');
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// ARTWORK API METHODS
// ============================================

export const artworkApi = {
  // Get all artworks from /admin/art endpoint with ETag caching
  // This is the ONLY method to fetch artworks - uses /admin/art
  getAll: async (
    filters?: ArtworkFilters,
    pagination?: PaginationParams
  ): Promise<any> => {
    const params: any = { limit: 100 }; // Default limit set to 100
    if (pagination?.limit) params.limit = pagination.limit;
    if (pagination?.page) params.page = pagination.page;
    
    try {
      // Check if we have cached data
      const cachedData = cacheService.get('admin_art');
      const etag = cacheService.getIfNoneMatch();
      
      // Make request with If-None-Match header (handled by interceptor)
      const response = await apiClient.get<any>('/admin/art', { params });
      
      // If we get here, it's either a 200 (new data) or 304 (cached data from interceptor)
      return response.data;
    } catch (error) {
      // If there's an error and we have cached data, return it
      const cachedData = cacheService.get('admin_art');
      if (cachedData) {
        console.log('Error fetching data, returning cached version');
        return cachedData;
      }
      throw error;
    }
  },

  // Get single artwork by ID
  getById: async (id: number): Promise<ApiResponse<Artwork>> => {
    const response = await apiClient.get<ApiResponse<Artwork>>(`/api/artworks/${id}`);
    return response.data;
  },

  // Create new artwork using /admin/art endpoint
  create: async (data: CreateArtworkDto): Promise<any> => {
    const formData = new FormData();
    
    // Map fields to match API requirements: title, price, description, image
    formData.append('title', data.title);
    formData.append('price', String(data.price));
    formData.append('description', data.description);
    
    // Add the image file
    if (data.image_url instanceof File) {
      formData.append('image', data.image_url);
    }
    
    // Add optional fields if provided
    if (data.artist) formData.append('artist', data.artist);
    if (data.dimensions) formData.append('dimensions', data.dimensions);
    if (data.medium) formData.append('medium', data.medium);
    if (data.year) formData.append('year', String(data.year));
    if (data.category) formData.append('category', data.category);

    const response = await apiClient.post<any>('/admin/art', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Clear cache after successful upload to force refresh
    cacheService.remove('admin_art');
    
    // Store ETag from response headers if present
    const etag = response.headers['etag'];
    if (etag) {
      console.log('Received ETag from upload:', etag);
    }
    
    return response.data;
  },

  // Update existing artwork
  update: async (id: number, data: UpdateArtworkDto): Promise<ApiResponse<Artwork>> => {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'id') {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await apiClient.put<ApiResponse<Artwork>>(`/api/artworks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete artwork
  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/art/${id}`);
    
    // Clear cache after successful delete to force refresh
    cacheService.remove('admin_art');
    
    return response.data;
  },

  // Get artwork statistics
  getStats: async (): Promise<ApiResponse<ArtworkStats>> => {
    const response = await apiClient.get<ApiResponse<ArtworkStats>>('/api/artworks/stats');
    return response.data;
  },

  // Get featured artworks
  getFeatured: async (): Promise<ApiResponse<Artwork[]>> => {
    const response = await apiClient.get<ApiResponse<Artwork[]>>('/api/artworks/featured');
    return response.data;
  },
};

// ============================================
// AUTHENTICATION API METHODS
// ============================================

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<any> => {
    const response = await apiClient.post<any>('/admin/login', credentials);
    
    // Store token from actual backend response format
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return response.data;
  },

  // Register new user
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  },
};

// ============================================
// USER/PROFILE API METHODS
// ============================================

export const userApi = {
  // Update profile
  updateProfile: async (data: UpdateProfileDto): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/api/users/profile', data);
    
    // Update user in localStorage
    if (response.data.success && response.data.data) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ============================================
// ORDER API METHODS
// ============================================

export const orderApi = {
  // Get all orders from /admin/orders endpoint (admin only, requires bearer token)
  getAll: async (pagination?: PaginationParams): Promise<any> => {
    const response = await apiClient.get<any>('/admin/orders', {
      params: pagination,
    });
    return response.data;
  },

  // Get single order by ID
  getById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`);
    return response.data;
  },

  // Create new order
  create: async (data: CreateOrderDto): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>('/api/orders', data);
    return response.data;
  },

  // Create order using backend /order endpoint
  createOrder: async (data: OrderCreate): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/order', data);
    return response.data;
  },

  // Update order status (admin)
  updateStatus: async (
    id: number,
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
  ): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Get order statistics (admin)
  getStats: async (): Promise<ApiResponse<OrderStats>> => {
    const response = await apiClient.get<ApiResponse<OrderStats>>('/api/orders/stats');
    return response.data;
  },

  // Search orders
  search: async (query: string): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/api/orders/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// ============================================
// UTILITY METHODS
// ============================================

export const apiUtils = {
  // Upload image
  uploadImage: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      '/api/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse<{ status: string }>> => {
    const response = await apiClient.get<ApiResponse<{ status: string }>>('/api/health');
    return response.data;
  },
};

// Export the configured axios instance for custom requests
export { apiClient };

// Default export with all API methods
export default {
  artwork: artworkApi,
  auth: authApi,
  user: userApi,
  order: orderApi,
  utils: apiUtils,
};

// Made with Bob
