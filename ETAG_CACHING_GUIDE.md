# ETag Caching Implementation Guide

## Overview

This implementation provides HTTP ETag-based caching for the `/admin/art` API endpoint. When the API is called, the response data and ETag are stored in localStorage. Subsequent requests include the `If-None-Match` header with the stored ETag value, allowing the server to return a 304 Not Modified response if the data hasn't changed.

## Features

✅ Automatic ETag storage in localStorage  
✅ If-None-Match header automatically added to requests  
✅ 304 Not Modified response handling  
✅ Cached data returned when server indicates no changes  
✅ Fallback to cached data on network errors  
✅ Cache management utilities (clear, check age, etc.)

## Implementation Details

### 1. Cache Service (`src/services/cache.service.ts`)

Manages localStorage operations for caching:

```typescript
import cacheService from './services/cache.service';

// Store data with ETag
cacheService.set('admin_art', data, etag);

// Get cached data
const data = cacheService.get('admin_art');

// Get ETag value
const etag = cacheService.getETag('admin_art');

// Get If-None-Match header value
const ifNoneMatch = cacheService.getIfNoneMatch();

// Clear cache
cacheService.clear();
```

### 2. API Service Updates (`src/services/api.service.ts`)

#### Request Interceptor
Automatically adds `If-None-Match` header to `/admin/art` requests:

```typescript
// Request interceptor adds If-None-Match header
if (config.url === '/admin/art' && config.method === 'get') {
  const etag = cacheService.getIfNoneMatch();
  if (etag && config.headers) {
    config.headers['If-None-Match'] = etag;
  }
}
```

#### Response Interceptor
Handles caching and 304 responses:

```typescript
// On successful response - cache data and ETag
if (response.config.url === '/admin/art') {
  const etag = response.headers['etag'];
  if (etag && response.data) {
    cacheService.set('admin_art', response.data, etag);
  }
}

// On 304 Not Modified - return cached data
if (error.response?.status === 304) {
  const cachedData = cacheService.get('admin_art');
  return Promise.resolve({ data: cachedData, status: 304 });
}
```

### 3. New API Method

Added `getAllAdmin()` method for ETag-cached requests:

```typescript
import { artworkApi } from './services/api.service';

// Use the ETag-cached endpoint
const data = await artworkApi.getAllAdmin();
```

## LocalStorage Keys

The implementation uses the following localStorage keys:

| Key | Description | Example Value |
|-----|-------------|---------------|
| `api_cache_admin_art` | Cached response data with timestamp | `{"data": {...}, "etag": "...", "timestamp": 1234567890}` |
| `etag_admin_art` | ETag value for the endpoint | `"W/\"abc123def456\""` |
| `If-None-Match` | Current ETag (as requested) | `"W/\"abc123def456\""` |

## Usage Examples

### Basic Usage

```typescript
import { artworkApi } from './services/api.service';

// First call - fetches from server, stores ETag
const artworks1 = await artworkApi.getAllAdmin();

// Second call - sends If-None-Match header
// If data unchanged: returns cached data (304)
// If data changed: returns new data with new ETag (200)
const artworks2 = await artworkApi.getAllAdmin();
```

### With React Component

```typescript
import React, { useEffect, useState } from 'react';
import { artworkApi } from '../services/api.service';
import cacheService from '../services/cache.service';

function ArtworkList() {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const data = await artworkApi.getAllAdmin();
        setArtworks(data.artworks || []);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div>
      {artworks.map(artwork => (
        <div key={artwork.id}>{artwork.title}</div>
      ))}
    </div>
  );
}
```

### Cache Management

```typescript
import cacheService from './services/cache.service';

// Check if cache exists
if (cacheService.has('admin_art')) {
  console.log('Cache exists');
}

// Get cache age
const age = cacheService.getCacheAge('admin_art');
console.log(`Cache is ${age}ms old`);

// Check if expired (default: 1 hour)
if (cacheService.isExpired('admin_art')) {
  console.log('Cache is expired');
}

// Clear specific cache
cacheService.remove('admin_art');

// Clear all caches
cacheService.clear();
```

## How It Works

### First Request Flow

1. Client makes GET request to `/admin/art`
2. Server responds with data and `ETag` header
3. Response interceptor stores data and ETag in localStorage
4. ETag is stored in `If-None-Match` key
5. Data is returned to the caller

### Subsequent Request Flow

1. Client makes GET request to `/admin/art`
2. Request interceptor adds `If-None-Match` header with stored ETag
3. Server compares ETag with current data version
4. **If data unchanged:**
   - Server returns 304 Not Modified
   - Response interceptor returns cached data
5. **If data changed:**
   - Server returns 200 OK with new data and new ETag
   - Response interceptor updates cache with new data and ETag

## Network Tab Inspection

To verify the implementation:

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Make first request - observe:
   - Request has no `If-None-Match` header
   - Response has `ETag` header
   - Response status: 200 OK
4. Make second request - observe:
   - Request has `If-None-Match` header with ETag value
   - Response status: 304 Not Modified (if data unchanged)
   - Or 200 OK with new ETag (if data changed)

## Testing

### Manual Testing

1. Start the development server
2. Navigate to the example page (if added to routes)
3. Click "Fetch Artworks" button
4. Check browser console for cache logs
5. Check Network tab for ETag headers
6. Click "Fetch Artworks" again to see 304 response

### Console Logs

The implementation includes helpful console logs:

```
Cached /admin/art response with ETag: "W/\"abc123\""
304 Not Modified - returning cached data
Error fetching data, returning cached version
```

## Benefits

1. **Reduced Bandwidth**: 304 responses have no body, saving bandwidth
2. **Faster Loading**: Cached data returned immediately
3. **Server Load**: Reduced server processing for unchanged data
4. **Offline Support**: Cached data available during network issues
5. **Automatic**: No manual cache management needed

## API Requirements

Your backend API must:

1. Return `ETag` header in responses
2. Accept `If-None-Match` header in requests
3. Return 304 Not Modified when ETag matches
4. Return 200 OK with new ETag when data changes

Example backend response headers:
```
ETag: "W/\"abc123def456\""
Cache-Control: no-cache
```

## Troubleshooting

### Cache not working

1. Check if API returns `ETag` header
2. Verify localStorage is enabled
3. Check browser console for errors
4. Inspect Network tab for headers

### Always getting 200 responses

1. Verify server supports ETag comparison
2. Check if `If-None-Match` header is sent
3. Ensure ETag format matches server expectations

### Stale data

1. Clear cache: `cacheService.clear()`
2. Check cache age: `cacheService.getCacheAge('admin_art')`
3. Implement cache expiration logic if needed

## Advanced Usage

### Custom Cache Expiration

```typescript
// Check if cache is older than 5 minutes
const fiveMinutes = 5 * 60 * 1000;
if (cacheService.isExpired('admin_art', fiveMinutes)) {
  cacheService.remove('admin_art');
}
```

### Force Refresh

```typescript
// Clear cache before fetching
cacheService.remove('admin_art');
const freshData = await artworkApi.getAllAdmin();
```

## Files Modified/Created

- ✅ `src/services/cache.service.ts` - Cache management utility
- ✅ `src/services/api.service.ts` - Updated with ETag support
- ✅ `src/examples/ETagCachingExample.tsx` - Example component
- ✅ `ETAG_CACHING_GUIDE.md` - This documentation

## Next Steps

1. Test with your backend API
2. Verify ETag headers are returned
3. Monitor Network tab for 304 responses
4. Adjust cache expiration as needed
5. Add cache management UI if desired

---

**Implementation by Bob** 🤖