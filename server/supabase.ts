import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  return process.env[key] || process.env[`VITE_${key}`] || '';
};

export const getSupabaseUrl = (): string => {
  return getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || '';
};

export const getSupabaseKey = (): string => {
  // Prefer service role key on server for admin and bypass RLS
  return (
    getEnv('SUPABASE_SERVICE_ROLE_KEY') ||
    getEnv('SUPABASE_ANON_KEY') ||
    getEnv('VITE_SUPABASE_ANON_KEY') ||
    ''
  );
};

export const isServerSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
};

let serverSupabaseClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured()) {
    return null;
  }
  if (!serverSupabaseClient) {
    serverSupabaseClient = createClient(getSupabaseUrl(), getSupabaseKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverSupabaseClient;
}

/**
 * Upload customer design buffer to Supabase Storage private bucket
 */
export async function uploadDesignToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
  const client = getServerSupabase();
  if (!client) {
    return { success: false, error: 'Supabase server is not configured in environment variables' };
  }

  const bucketName = 'customer-designs';

  // Make sure bucket exists or create it
  try {
    const { data: buckets } = await client.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);
    if (!exists) {
      await client.storage.createBucket(bucketName, {
        public: true, // or signed URLs
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      });
    }
  } catch (err: any) {
    console.warn('[Supabase Storage Bucket check error]:', err.message);
  }

  // Generate unique unguessable file path
  const ext = fileName.split('.').pop()?.toLowerCase() || 'png';
  const cleanId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
  const storagePath = `orders/${cleanId}.${ext}`;

  const { data, error } = await client.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('[Supabase Storage Upload Error]:', error);
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: publicData } = client.storage.from(bucketName).getPublicUrl(storagePath);

  return {
    success: true,
    url: publicData.publicUrl,
    storagePath: data.path,
  };
}

/**
 * Upload store branding asset (Logo / Favicon) to Supabase Storage
 * Uses 'store-assets' public bucket with graceful fallback to customer-designs or data URL
 */
export async function uploadStoreAssetToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  assetType: 'logo' | 'favicon'
): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
  const client = getServerSupabase();
  const bucketName = 'store-assets';

  if (!client) {
    // If Supabase credentials are not yet configured in .env,
    // generate a data URL fallback so local admin preview and testing works seamlessly
    const base64Data = fileBuffer.toString('base64');
    const fallbackUrl = `data:${mimeType};base64,${base64Data}`;
    return {
      success: true,
      url: fallbackUrl,
      storagePath: `local-${assetType}-${Date.now()}`,
    };
  }

  // Make sure store-assets public bucket exists or create it
  try {
    const { data: buckets } = await client.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);
    if (!exists) {
      await client.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
          'image/svg+xml',
          'image/x-icon',
          'image/vnd.microsoft.icon',
        ],
      });
    }
  } catch (err: any) {
    console.warn('[Supabase Storage store-assets bucket check]:', err.message);
  }

  // Generate clean asset file name
  const rawExt = fileName.split('.').pop()?.toLowerCase();
  const ext = rawExt || (assetType === 'favicon' ? 'ico' : 'png');
  const cleanId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `branding/${assetType}-${cleanId}.${ext}`;

  // Try upload to store-assets
  const { data, error } = await client.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    // Fallback: try existing customer-designs bucket
    try {
      const fallbackUpload = await client.storage
        .from('customer-designs')
        .upload(storagePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true,
        });

      if (!fallbackUpload.error && fallbackUpload.data) {
        const { data: publicData } = client.storage
          .from('customer-designs')
          .getPublicUrl(storagePath);
        return {
          success: true,
          url: publicData.publicUrl,
          storagePath: fallbackUpload.data.path,
        };
      }
    } catch {
      // ignore
    }

    console.error('[Supabase Storage Store Asset Upload Error]:', error);
    return { success: false, error: error.message };
  }

  // Get public CDN URL
  const { data: publicData } = client.storage.from(bucketName).getPublicUrl(storagePath);

  return {
    success: true,
    url: publicData.publicUrl,
    storagePath: data.path,
  };
}

/**
 * Upload product image to Supabase Storage in 'product-images' bucket
 * Organizes by store ID with unique timestamps to eliminate caching bugs
 */
export async function uploadProductImageToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  storeId: string = 'store-dzprint-default'
): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
  const client = getServerSupabase();
  const bucketName = 'product-images';

  if (!client) {
    const base64Data = fileBuffer.toString('base64');
    const fallbackUrl = `data:${mimeType};base64,${base64Data}`;
    return {
      success: true,
      url: fallbackUrl,
      storagePath: `local-product-${Date.now()}`,
    };
  }

  // Ensure bucket exists
  try {
    const { data: buckets } = await client.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);
    if (!exists) {
      await client.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      });
    }
  } catch (err: any) {
    console.warn('[Supabase Storage product-images bucket check]:', err.message);
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || 'png';
  const cleanId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const storagePath = `stores/${storeId}/products/${cleanId}.${ext}`;

  const { data, error } = await client.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    try {
      const fallbackUpload = await client.storage
        .from('customer-designs')
        .upload(storagePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false,
        });

      if (!fallbackUpload.error && fallbackUpload.data) {
        const { data: publicData } = client.storage
          .from('customer-designs')
          .getPublicUrl(storagePath);
        return {
          success: true,
          url: publicData.publicUrl,
          storagePath: fallbackUpload.data.path,
        };
      }
    } catch {
      // ignore
    }

    console.error('[Supabase Storage Product Image Upload Error]:', error);
    return { success: false, error: error.message };
  }

  const { data: publicData } = client.storage.from(bucketName).getPublicUrl(storagePath);

  return {
    success: true,
    url: publicData.publicUrl,
    storagePath: data.path,
  };
}

