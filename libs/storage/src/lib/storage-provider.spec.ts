import type { StorageProvider } from './storage-provider.interface.js';

describe('StorageProvider', () => {
  it('defines the upload/download/getSignedUrl/delete contract', () => {
    const shape: (keyof StorageProvider)[] = [
      'upload',
      'download',
      'getSignedUrl',
      'delete',
    ];
    expect(shape).toHaveLength(4);
  });
});
