export interface StorageProvider {
  upload(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string>;
  download(bucket: string, path: string): Promise<Buffer>;
  getSignedUrl(
    bucket: string,
    path: string,
    expiresIn?: number,
  ): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
}
