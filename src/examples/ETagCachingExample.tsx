import React, { useEffect, useState } from 'react';
import { artworkApi } from '../services/api.service';
import cacheService from '../services/cache.service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

/**
 * Example component demonstrating ETag caching implementation
 * 
 * This shows how the /admin/art endpoint uses ETag caching:
 * 1. First request: Gets data and stores ETag in localStorage
 * 2. Subsequent requests: Sends If-None-Match header with stored ETag
 * 3. If data unchanged: Server returns 304, cached data is used
 * 4. If data changed: Server returns 200 with new data and ETag
 */
const ETagCachingExample: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    hasCache: boolean;
    etag: string | null;
    cacheAge: number | null;
  }>({
    hasCache: false,
    etag: null,
    cacheAge: null,
  });

  // Update cache info
  const updateCacheInfo = () => {
    setCacheInfo({
      hasCache: cacheService.has('admin_art'),
      etag: cacheService.getIfNoneMatch(),
      cacheAge: cacheService.getCacheAge('admin_art'),
    });
  };

  // Fetch artworks using ETag caching
  const fetchArtworks = async () => {
    setLoading(true);
    try {
      console.log('Fetching artworks from /admin/art...');
      const data = await artworkApi.getAll();
      setArtworks(data.items || data.artworks || data || []);
      updateCacheInfo();
      console.log('Artworks fetched successfully');
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear cache
  const clearCache = () => {
    cacheService.clear();
    updateCacheInfo();
    console.log('Cache cleared');
  };

  // Load cache info on mount
  useEffect(() => {
    updateCacheInfo();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ETag Caching Example</CardTitle>
          <CardDescription>
            Demonstrates HTTP ETag caching with If-None-Match header
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cache Information */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">Cache Status</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Has Cache:</span>{' '}
                <span className={cacheInfo.hasCache ? 'text-green-600' : 'text-red-600'}>
                  {cacheInfo.hasCache ? 'Yes' : 'No'}
                </span>
              </p>
              <p>
                <span className="font-medium">ETag (If-None-Match):</span>{' '}
                <code className="bg-gray-200 px-2 py-1 rounded">
                  {cacheInfo.etag || 'None'}
                </code>
              </p>
              <p>
                <span className="font-medium">Cache Age:</span>{' '}
                {cacheInfo.cacheAge !== null
                  ? `${Math.round(cacheInfo.cacheAge / 1000)} seconds`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={fetchArtworks} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Artworks (with ETag)'}
            </Button>
            <Button onClick={clearCache} variant="outline">
              Clear Cache
            </Button>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">How It Works</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                <strong>First Request:</strong> API returns data with ETag header
              </li>
              <li>
                <strong>Cache Storage:</strong> Response data and ETag stored in localStorage
              </li>
              <li>
                <strong>Subsequent Requests:</strong> If-None-Match header sent with stored ETag
              </li>
              <li>
                <strong>304 Response:</strong> If data unchanged, server returns 304, cached data used
              </li>
              <li>
                <strong>200 Response:</strong> If data changed, server returns new data with new ETag
              </li>
            </ol>
          </div>

          {/* LocalStorage Keys */}
          <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">LocalStorage Keys</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <code className="bg-gray-200 px-2 py-1 rounded">api_cache_admin_art</code> - Cached
                response data
              </li>
              <li>
                <code className="bg-gray-200 px-2 py-1 rounded">etag_admin_art</code> - ETag value
              </li>
              <li>
                <code className="bg-gray-200 px-2 py-1 rounded">If-None-Match</code> - Current ETag
                (as requested)
              </li>
            </ul>
          </div>

          {/* Artworks Display */}
          {artworks.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                Loaded Artworks ({artworks.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artworks.slice(0, 6).map((artwork: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <p className="font-medium">{artwork.title || artwork.name || 'Untitled'}</p>
                      <p className="text-sm text-gray-600">
                        {artwork.artist || 'Unknown Artist'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developer Console */}
      <Card>
        <CardHeader>
          <CardTitle>Developer Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Open the browser's <strong>Developer Console</strong> and{' '}
            <strong>Network tab</strong> to see:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Request headers including If-None-Match</li>
            <li>Response headers including ETag</li>
            <li>304 Not Modified responses when data hasn't changed</li>
            <li>Console logs showing cache operations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ETagCachingExample;

// Made with Bob
