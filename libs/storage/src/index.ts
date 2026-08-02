export * from './lib/storage-provider.interface';
import { SupabaseStorageProvider } from './lib/supabase-storage-provider';

export const storageProvider = new SupabaseStorageProvider();
