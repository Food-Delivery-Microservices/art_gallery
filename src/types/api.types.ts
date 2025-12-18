// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Artwork Types
export interface Artwork {
  id: number;
  title: string;
  artist?: string;
  price: number;
  category: string;
  image_url: string;
  thumbnail_url?: string;
  description: string;
  dimensions?: string;
  medium?: string;
  year?: number;
  featured?: boolean;
  inStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateArtworkDto {
  title: string;
  artist?: string;
  price: number;
  category: string;
  image_url: File | string;
  description: string;
  dimensions?: string;
  medium?: string;
  year?: number;
  featured?: boolean;
  inStock?: boolean;
}

export interface UpdateArtworkDto extends Partial<CreateArtworkDto> {
  id: number;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface UpdateProfileDto {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Order/Purchase Types
export interface CartItem {
  id: number;
  artwork: Artwork;
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  artworkId: number;
  artworkTitle: string;
  artworkImage: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    artworkId: number;
    quantity: number;
  }[];
  shippingAddress: string;
  paymentMethod: string;
}

// Backend Order Create Type (POST /order)
export interface OrderCreate {
  artwork_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  message?: string;
}

export interface OrderResponse {
  id: number;
  artwork_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  message?: string;
  status: string;
  created_at: string;
}

// Filter and Search Types
export interface ArtworkFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  artist?: string;
  search?: string;
  featured?: boolean;
  inStock?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Statistics Types
export interface ArtworkStats {
  total: number;
  byCategory: {
    [key: string]: number;
  };
  totalValue: number;
  averagePrice: number;
}

export interface OrderStats {
  total: number;
  totalRevenue: number;
  byStatus: {
    [key: string]: number;
  };
  recentOrders: Order[];
}

// Made with Bob
