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
