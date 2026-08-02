import { createClient } from '@supabase/supabase-js';
import type { StorageProvider } from './storage-provider.interface.js';

export class SupabaseStorageProvider implements StorageProvider {
  private client = createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
  );

  async upload(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.client.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });
    if (error) throw error;
    return path;
  }

  async download(bucket: string, path: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path);
    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
  }

  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
}
