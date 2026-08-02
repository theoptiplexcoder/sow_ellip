import { inngest } from './client.js';

describe('inngest client', () => {
  it('is configured with the app id', () => {
    expect(inngest.id).toBe('sow-platform');
  });
});
